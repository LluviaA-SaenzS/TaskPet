// useHabitos.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const N_HABITOS = 3
const LS_KEY    = 'tp_habitos_dia'
const STATS     = ['salud', 'animo', 'sed', 'hambre', 'sueno']

export const STAT_INFO = {
  salud:   { label: 'Salud',  emoji: '❤️',  color: '#ef4444' },
  animo:   { label: 'Ánimo',  emoji: '😊',  color: '#a855f7' },
  sed:     { label: 'Sed',    emoji: '💧',  color: '#3b82f6' },
  hambre:  { label: 'Hambre', emoji: '🦴',  color: '#f97316' },
  sueno:   { label: 'Sueño',  emoji: '🌙',  color: '#6366f1' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fechaHoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function msFaltaMedianoche() {
  const ahora  = new Date()
  const manana = new Date(ahora)
  manana.setDate(manana.getDate() + 1)
  manana.setHours(0, 0, 0, 0)
  return manana.getTime() - ahora.getTime()
}

function statDeHabito(idHabito) {
  return STATS[idHabito % STATS.length]
}

function elegirAleatorios(arr, n) {
  const copia  = [...arr]
  const result = []
  while (result.length < n && copia.length > 0) {
    const idx = Math.floor(Math.random() * copia.length)
    result.push(copia.splice(idx, 1)[0])
  }
  return result
}

// Siempre devuelve el bloque completo o null — nunca parcial
function leerDesdeLs() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.fecha !== fechaHoy()) return null
    if (!Array.isArray(parsed.habitos) || parsed.habitos.length === 0) return null
    return parsed  // { fecha, habitos, done }
  } catch {
    return null
  }
}

// Escribe siempre el bloque completo — habitos + done juntos
function escribirLs(habitos, done) {
  localStorage.setItem(LS_KEY, JSON.stringify({
    fecha: fechaHoy(),
    habitos,
    done,
  }))
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useHabitos(idUsuario) {
  // Estado unificado: habitos y done siempre se leen/escriben juntos
  const [habitos,     setHabitos]     = useState([])
  const [done,        setDone]        = useState({})
  const [msRestantes, setMsRestantes] = useState(msFaltaMedianoche)
  const [cargando,    setCargando]    = useState(true)
  const [error,       setError]       = useState(null)

  const pendingRef    = useRef(new Set())
  // Ref que siempre tiene los hábitos actuales (para usarlo en marcarHecho sin closure stale)
  const habitosRef    = useRef([])
  const doneRef       = useRef({})

  // Mantener refs sincronizados con el state
  useEffect(() => { habitosRef.current = habitos }, [habitos])
  useEffect(() => { doneRef.current    = done    }, [done])

  // ── Cargar desde Supabase ─────────────────────────────────────────────────

  const cargarDeSupabase = useCallback(async () => {
    setCargando(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('habitos')
      .select('id_habito, nombre, unidad')

    if (err || !data?.length) {
      setError('No se pudieron cargar los hábitos.')
      setCargando(false)
      return
    }

    const conStat   = data.map((h) => ({ ...h, stat: statDeHabito(h.id_habito) }))
    const seleccion = elegirAleatorios(conStat, Math.min(N_HABITOS, conStat.length))
    const doneFresh = {}

    escribirLs(seleccion, doneFresh)
    setHabitos(seleccion)
    setDone(doneFresh)
    setCargando(false)
  }, [])

  // ── Inicializar al montar / cuando llega idUsuario ────────────────────────

  useEffect(() => {
    if (!idUsuario) return

    const cache = leerDesdeLs()
    if (cache) {
      // Restaurar desde localStorage — incluye done del día
      setHabitos(cache.habitos)
      setDone(cache.done ?? {})
      setCargando(false)
    } else {
      // No hay cache válido → ir a Supabase
      cargarDeSupabase()
    }
  }, [idUsuario, cargarDeSupabase])

  // ── Countdown + reset a medianoche ────────────────────────────────────────

  useEffect(() => {
    const tick = setInterval(() => {
      const ms = msFaltaMedianoche()
      setMsRestantes(ms)
      if (ms <= 1000 && idUsuario) {
        localStorage.removeItem(LS_KEY)
        setHabitos([])
        setDone({})
        cargarDeSupabase()
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [idUsuario, cargarDeSupabase])

  // ── marcarHecho — solo en una dirección, siempre persiste ────────────────

  const marcarHecho = useCallback(async (idHabito) => {
    if (!idUsuario) return { ok: false, error: 'Sin usuario' }
    if (pendingRef.current.has(idHabito)) return { ok: false, error: 'En proceso' }

    // Usar refs para evitar closures stale
    const doneActual    = { ...doneRef.current }
    const habitosActual = habitosRef.current

    // Ya marcado: no des-marcar, no volver a llamar Supabase
    if (doneActual[idHabito]) return { ok: true, yaHecho: true }

    const habito = habitosActual.find((h) => h.id_habito === idHabito)
    if (!habito) return { ok: false, error: 'Hábito no encontrado' }

    pendingRef.current.add(idHabito)

    // Actualización optimista en state + localStorage
    const nuevoDone = { ...doneActual, [idHabito]: true }
    setDone(nuevoDone)
    // Escribir siempre con los hábitos actuales — no depende de que cache exista
    escribirLs(habitosActual, nuevoDone)

    // Persistir en Supabase
    const hoy = fechaHoy()
    const { data: existente } = await supabase
      .from('registrar_habitos')
      .select('id_registro, acumulado')
      .eq('id_usuario', idUsuario)
      .eq('id_habito',  idHabito)
      .eq('fecha',      hoy)
      .maybeSingle()

    let errFinal = null

    if (existente) {
      const { error: e } = await supabase
        .from('registrar_habitos')
        .update({ acumulado: existente.acumulado + habito.unidad })
        .eq('id_registro', existente.id_registro)
      errFinal = e
    } else {
      const { error: e } = await supabase
        .from('registrar_habitos')
        .insert({
          id_usuario: idUsuario,
          id_habito:  idHabito,
          fecha:      hoy,
          acumulado:  habito.unidad,
        })
      errFinal = e
    }

    if (errFinal) {
      // Revertir
      const revert = { ...nuevoDone, [idHabito]: false }
      setDone(revert)
      escribirLs(habitosActual, revert)
      pendingRef.current.delete(idHabito)
      return { ok: false, error: errFinal.message }
    }

    pendingRef.current.delete(idHabito)
    return { ok: true, stat: habito.stat, puntos: habito.unidad }
  }, [idUsuario]) // sin habitos ni done en deps — usamos refs

  // ── Tiempo formateado ─────────────────────────────────────────────────────

  const tiempoFormateado = (() => {
    const totalSeg = Math.max(0, Math.floor(msRestantes / 1000))
    const hh = String(Math.floor(totalSeg / 3600)).padStart(2, '0')
    const mm = String(Math.floor((totalSeg % 3600) / 60)).padStart(2, '0')
    const ss = String(totalSeg % 60).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  })()

  const totalDone = Object.values(done).filter(Boolean).length

  return {
    habitosDia: habitos,
    done,
    totalDone,
    tiempoFormateado,
    msRestantes,
    cargando,
    error,
    marcarHecho,
    STAT_INFO,
  }
}