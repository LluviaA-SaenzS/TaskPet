// useStreak.js
// ultima_fecha = último día en que el usuario completó al menos una tarea
// acumulado    = días consecutivos con al menos una tarea completada
// dias_semana  = array de días (0-6) de la semana actual con tarea completada
// La racha se rompe si ultima_fecha no es hoy ni ayer

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ── helpers ──────────────────────────────────────────────────────────────────

function fechaLocal(date = new Date()) {
  // YYYY-MM-DD en hora local (evita desfase UTC)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function hoy() { return fechaLocal() }

function ayer() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return fechaLocal(d)
}

function diaDeSemanaHoy() {
  return new Date().getDay() // 0=dom … 6=sab
}

// ¿La fecha pertenece a la semana calendario actual (dom→sab)?
function esEstaSemana(fechaStr) {
  const ahora   = new Date()
  const domingo = new Date(ahora)
  domingo.setDate(ahora.getDate() - ahora.getDay())
  domingo.setHours(0, 0, 0, 0)

  const sabado = new Date(domingo)
  sabado.setDate(domingo.getDate() + 6)
  sabado.setHours(23, 59, 59, 999)

  // fechaStr es YYYY-MM-DD — parseamos como local
  const [y, mo, d] = fechaStr.split('-').map(Number)
  const f = new Date(y, mo - 1, d)
  return f >= domingo && f <= sabado
}

// ── hook ─────────────────────────────────────────────────────────────────────

export function useStreak(idUsuario) {
  const [racha,    setRacha]    = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)

  // Ref para evitar doble llamada si registrarActividad se llama rápido
  const registrandoRef = useRef(false)

  // ── cargar / inicializar racha ─────────────────────────────────────────────
  const cargarRacha = useCallback(async () => {
    if (!idUsuario) return

    setCargando(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('rachas')
      .select('*')
      .eq('id_usuario', idUsuario)
      .maybeSingle()

    if (err) {
      setError('Error al cargar la racha.')
      setCargando(false)
      return
    }

    // Primera vez — crear registro vacío
    if (!data) {
      const { data: nueva, error: errCrear } = await supabase
        .from('rachas')
        .insert({
          id_usuario:   idUsuario,
          acumulado:    0,
          maxima:       0,
          ultima_fecha: null,   // null = nunca completó una tarea
          dias_semana:  [],
        })
        .select()
        .single()

      if (errCrear) {
        setError('Error al crear la racha.')
        setCargando(false)
        return
      }

      setRacha(nueva)
      setCargando(false)
      return
    }

    // ¿Se rompió la racha? (solo si ultima_fecha existe y no es hoy ni ayer)
    if (data.ultima_fecha && data.acumulado > 0) {
      const ultima = fechaLocal(new Date(data.ultima_fecha))
      const seRompio = ultima !== hoy() && ultima !== ayer()

      if (seRompio) {
        // Limpiar días si la semana también cambió
        const diasSemana = esEstaSemana(ultima) ? data.dias_semana : []

        const { data: reseteada } = await supabase
          .from('rachas')
          .update({ acumulado: 0, dias_semana: diasSemana })
          .eq('id_usuario', idUsuario)
          .select()
          .single()

        setRacha(reseteada ?? { ...data, acumulado: 0, dias_semana: diasSemana })
        setCargando(false)
        return
      }
    }

    // ¿Cambió la semana sin romper racha? Limpiar días
    if (data.dias_semana?.length > 0 && data.ultima_fecha) {
      const ultima = fechaLocal(new Date(data.ultima_fecha))
      if (!esEstaSemana(ultima)) {
        const { data: limpia } = await supabase
          .from('rachas')
          .update({ dias_semana: [] })
          .eq('id_usuario', idUsuario)
          .select()
          .single()

        setRacha(limpia ?? { ...data, dias_semana: [] })
        setCargando(false)
        return
      }
    }

    setRacha(data)
    setCargando(false)
  }, [idUsuario])

  useEffect(() => { cargarRacha() }, [cargarRacha])

  // ── registrarActividad — llamar cuando el usuario completa una tarea ────────
  const registrarActividad = useCallback(async () => {
    if (!idUsuario || !racha) return { ok: false, error: 'No hay racha cargada.' }
    if (registrandoRef.current) return { ok: true, yaContado: true }

    // Ya se registró hoy
    if (racha.ultima_fecha) {
      const ultima = fechaLocal(new Date(racha.ultima_fecha))
      if (ultima === hoy()) return { ok: true, yaContado: true }
    }

    registrandoRef.current = true

    // ¿Continúa la racha? (última actividad fue ayer)
    const continuaRacha = racha.ultima_fecha
      ? fechaLocal(new Date(racha.ultima_fecha)) === ayer()
      : false

    const nuevoAcumulado = continuaRacha ? racha.acumulado + 1 : 1
    const nuevaMaxima    = Math.max(nuevoAcumulado, racha.maxima ?? 0)

    // Días de la semana
    const diaHoy       = diaDeSemanaHoy()
    const diasBase     = (racha.ultima_fecha && esEstaSemana(fechaLocal(new Date(racha.ultima_fecha))))
      ? racha.dias_semana ?? []
      : []
    const nuevosDias   = diasBase.includes(diaHoy) ? diasBase : [...diasBase, diaHoy]

    const { data: actualizada, error: err } = await supabase
      .from('rachas')
      .update({
        acumulado:    nuevoAcumulado,
        maxima:       nuevaMaxima,
        ultima_fecha: new Date().toISOString(),
        dias_semana:  nuevosDias,
      })
      .eq('id_usuario', idUsuario)
      .select()
      .single()

    registrandoRef.current = false

    if (err) return { ok: false, error: 'Error al actualizar la racha.' }

    setRacha(actualizada)
    return { ok: true, yaContado: false, racha: actualizada }
  }, [idUsuario, racha])

  // ── estado derivado ────────────────────────────────────────────────────────

  // ¿Completó alguna tarea hoy?
  const actividadHoy = racha?.ultima_fecha
    ? fechaLocal(new Date(racha.ultima_fecha)) === hoy()
    : false

  // Qué días de esta semana tienen palomita
  const semanaVisual = Array.from({ length: 7 }, (_, i) =>
    racha?.dias_semana?.includes(i) ?? false
  )

  return {
    racha,
    cargando,
    error,
    actividadHoy,       // bool: completó tarea hoy
    semanaVisual,       // bool[7]: días 0-6 con tarea completada esta semana
    registrarActividad, // llamar cuando se completa una tarea
    recargar: cargarRacha,
  }
}
