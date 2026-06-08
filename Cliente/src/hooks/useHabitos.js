// useHabitos.js
// Maneja las "tareas especiales" de la página Mascota.
//
// Flujo:
//  1. Carga hábitos de Supabase (solo al montar)
//  2. Busca en localStorage si ya hay una selección válida (< 12 hrs)
//  3. Si no hay o venció, elige 3 al azar y los guarda en localStorage
//  4. marcarHecho → escribe en registrar_habitos y actualiza done[] local
//
// Mapeo de stat (sin columna extra en Supabase):
//   id_habito % 5 → 0:salud  1:animo  2:sed  3:hambre  4:sueno

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ── Constantes ────────────────────────────────────────────────────────────────

const DURACION_MS   = 12 * 60 * 60 * 1000   // 12 horas en milisegundos
const N_HABITOS     = 3                       // cuántas tareas especiales por turno
const LS_KEY        = 'tp_habitos_dia'        // clave en localStorage

const STATS = ['salud', 'animo', 'sed', 'hambre', 'sueno']

// Iconos y colores por stat (para mostrar en la UI)
export const STAT_INFO = {
  salud:   { label: 'Salud',   emoji: '❤️',  color: '#ef4444' },
  animo:   { label: 'Ánimo',   emoji: '😊',  color: '#a855f7' },
  sed:     { label: 'Sed',     emoji: '💧',  color: '#3b82f6' },
  hambre:  { label: 'Hambre',  emoji: '🦴',  color: '#f97316' },
  sueno:   { label: 'Sueño',   emoji: '🌙',  color: '#6366f1' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Asigna un stat de forma determinista según el id del hábito */
function statDeHabito(idHabito) {
  return STATS[idHabito % STATS.length]
}

/** Elige n elementos aleatorios de un array sin repetir */
function elegirAleatorios(arr, n) {
  const copia = [...arr]
  const result = []
  while (result.length < n && copia.length > 0) {
    const idx = Math.floor(Math.random() * copia.length)
    result.push(copia.splice(idx, 1)[0])
  }
  return result
}

/** Lee el bloque guardado en localStorage y lo valida */
function leerDesdeLs() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    const ahora  = Date.now()

    if (!parsed.generadoEn || !Array.isArray(parsed.habitos)) return null
    if (ahora - parsed.generadoEn >= DURACION_MS) return null

    return parsed   // { generadoEn, habitos, done }
  } catch {
    return null
  }
}

/** Guarda el bloque en localStorage */
function guardarEnLs(habitos, done = {}) {
  const bloque = {
    generadoEn: Date.now(),
    habitos,
    done,
  }
  localStorage.setItem(LS_KEY, JSON.stringify(bloque))
  return bloque
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useHabitos(idUsuario) {
  const [habitosDia,  setHabitosDia]  = useState([])
  const [done,        setDone]        = useState({})
  const [msRestantes, setMsRestantes] = useState(DURACION_MS)
  const [cargando,    setCargando]    = useState(true)
  const [error,       setError]       = useState(null)

  // ── Inicializar ─────────────────────────────────────────────────────────────

  const inicializar = useCallback(async () => {
    setCargando(true)
    setError(null)

    // 1. ¿Hay datos válidos en localStorage?
    const cache = leerDesdeLs()
    if (cache) {
      setHabitosDia(cache.habitos)
      setDone(cache.done ?? {})
      setMsRestantes(DURACION_MS - (Date.now() - cache.generadoEn))
      setCargando(false)
      return
    }

    // 2. No hay cache → cargar hábitos de Supabase
    const { data, error: err } = await supabase
      .from('habitos')
      .select('id_habito, nombre, unidad')

    if (err || !data?.length) {
      setError('No se pudieron cargar los hábitos.')
      setCargando(false)
      return
    }

    // 3. Asignar stat y seleccionar N al azar
    const conStat    = data.map((h) => ({ ...h, stat: statDeHabito(h.id_habito) }))
    const seleccion  = elegirAleatorios(conStat, Math.min(N_HABITOS, conStat.length))

    // 4. Guardar en localStorage
    const bloque = guardarEnLs(seleccion, {})

    setHabitosDia(seleccion)
    setDone({})
    setMsRestantes(DURACION_MS - (Date.now() - bloque.generadoEn))
    setCargando(false)
  }, [])

  useEffect(() => {
    inicializar()
  }, [inicializar])

  // ── Countdown cada segundo ──────────────────────────────────────────────────

  useEffect(() => {
    if (cargando) return

    const tick = setInterval(() => {
      setMsRestantes((prev) => {
        const siguiente = prev - 1000
        if (siguiente <= 0) {
          localStorage.removeItem(LS_KEY)
          inicializar()
          return DURACION_MS
        }
        return siguiente
      })
    }, 1000)

    return () => clearInterval(tick)
  }, [cargando, inicializar])

  // ── Marcar hecho ────────────────────────────────────────────────────────────

  const marcarHecho = useCallback(async (idHabito) => {
    if (!idUsuario) return { ok: false, error: 'Sin usuario' }

    const habito  = habitosDia.find((h) => h.id_habito === idHabito)
    if (!habito)  return { ok: false, error: 'Hábito no encontrado' }

    const yaHecho    = done[idHabito] ?? false
    const nuevoDone  = { ...done, [idHabito]: !yaHecho }

    // Actualización optimista
    setDone(nuevoDone)

    // Persistir done en localStorage
    const cache = leerDesdeLs()
    if (cache) {
      localStorage.setItem(LS_KEY, JSON.stringify({ ...cache, done: nuevoDone }))
    }

    if (!yaHecho) {
      // Solo escribe a Supabase al marcar (no al desmarcar)
      const hoy = new Date().toISOString().split('T')[0]

      const { data: existente } = await supabase
        .from('registrar_habitos')
        .select('id_registro, acumulado')
        .eq('id_usuario', idUsuario)
        .eq('id_habito',  idHabito)
        .eq('fecha',      hoy)
        .single()

      if (existente) {
        const { error: errUpd } = await supabase
          .from('registrar_habitos')
          .update({ acumulado: existente.acumulado + habito.unidad })
          .eq('id_registro', existente.id_registro)

        if (errUpd) {
          console.warn('Error actualizando registro:', errUpd.message)
          setDone(done)
          return { ok: false, error: errUpd.message }
        }
      } else {
        const { error: errIns } = await supabase
          .from('registrar_habitos')
          .insert({
            id_usuario: idUsuario,
            id_habito:  idHabito,
            fecha:      hoy,
            acumulado:  habito.unidad,
          })

        if (errIns) {
          console.warn('Error insertando registro:', errIns.message)
          setDone(done)
          return { ok: false, error: errIns.message }
        }
      }

      return { ok: true, stat: habito.stat, puntos: habito.unidad }
    }

    return { ok: true }
  }, [idUsuario, habitosDia, done])

  // ── Tiempo formateado HH:MM:SS ──────────────────────────────────────────────

  const tiempoFormateado = (() => {
    const totalSeg = Math.max(0, Math.floor(msRestantes / 1000))
    const hh = String(Math.floor(totalSeg / 3600)).padStart(2, '0')
    const mm = String(Math.floor((totalSeg % 3600) / 60)).padStart(2, '0')
    const ss = String(totalSeg % 60).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  })()

  const totalDone = Object.values(done).filter(Boolean).length

  return {
    habitosDia,       // [{ id_habito, nombre, unidad, stat }]
    done,             // { [id_habito]: bool }
    totalDone,        // número de tareas marcadas
    tiempoFormateado, // 'HH:MM:SS'
    msRestantes,
    cargando,
    error,
    marcarHecho,      // async (idHabito) → { ok, stat?, puntos? }
    STAT_INFO,
  }
}
