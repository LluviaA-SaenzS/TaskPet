// logica de racha diaria
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ---------------------------------------------------------------- helpers
function hoy() {
  return new Date().toISOString().split('T')[0]
}

function ayer() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function diaDeSemanaHoy() {
  return new Date().getDay() // 0=domingo ... 6=sabado
}

function esLaMismaSemana(fecha) {
  const ahora   = new Date()
  const domingo = new Date(ahora)
  domingo.setDate(ahora.getDate() - ahora.getDay())
  domingo.setHours(0, 0, 0, 0)

  const sabado = new Date(domingo)
  sabado.setDate(domingo.getDate() + 6)
  sabado.setHours(23, 59, 59, 999)

  const f = new Date(fecha)
  return f >= domingo && f <= sabado
}

// ---------------------------------------------------------------- hook
export function useStreak(idUsuario) {
  const [racha,    setRacha]    = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)

  // ---------------------------------------------------- cargar racha
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

    if (!data) {
      // Primera vez — crear registro
      const { data: nueva, error: errCrear } = await supabase
        .from('rachas')
        .insert({
          id_usuario:   idUsuario,
          acumulado:    0,
          maxima:       0,
          ultima_fecha: new Date().toISOString(),
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

    const ultimaFecha = new Date(data.ultima_fecha).toISOString().split('T')[0]
    const seRompio    = ultimaFecha !== hoy() && ultimaFecha !== ayer()

    // Si se rompio — resetear acumulado, mantener maxima
    if (seRompio && data.acumulado > 0) {
      const diasSemana = esLaMismaSemana(data.ultima_fecha) ? data.dias_semana : []

      const { data: reseteada } = await supabase
        .from('rachas')
        .update({
          acumulado:    0,
          ultima_fecha: new Date().toISOString(),
          dias_semana:  diasSemana,
        })
        .eq('id_usuario', idUsuario)
        .select()
        .single()

      setRacha(reseteada)
      setCargando(false)
      return
    }

    // Si cambio la semana — limpiar dias_semana
    if (data.dias_semana?.length > 0 && !esLaMismaSemana(data.ultima_fecha)) {
      const { data: limpia } = await supabase
        .from('rachas')
        .update({ dias_semana: [] })
        .eq('id_usuario', idUsuario)
        .select()
        .single()

      setRacha(limpia)
      setCargando(false)
      return
    }

    setRacha(data)
    setCargando(false)
  }, [idUsuario])

  useEffect(() => {
    cargarRacha()
  }, [cargarRacha])

  // ---------------------------------------------------- registrar actividad
  async function registrarActividad() {
    if (!idUsuario || !racha) return { ok: false, error: 'No hay racha cargada.' }

    const ultimaFecha = new Date(racha.ultima_fecha).toISOString().split('T')[0]

    // Ya se registro hoy
    if (ultimaFecha === hoy()) {
      return { ok: true, yaContado: true }
    }

    const continua       = ultimaFecha === ayer()
    const nuevoAcumulado = continua ? racha.acumulado + 1 : 1
    const nuevaMaxima    = Math.max(nuevoAcumulado, racha.maxima)

    const diaHoy       = diaDeSemanaHoy()
    const diasActuales = esLaMismaSemana(racha.ultima_fecha)
      ? racha.dias_semana ?? []
      : []
    const nuevasDias   = diasActuales.includes(diaHoy)
      ? diasActuales
      : [...diasActuales, diaHoy]

    const { data: actualizada, error: err } = await supabase
      .from('rachas')
      .update({
        acumulado:    nuevoAcumulado,
        maxima:       nuevaMaxima,
        ultima_fecha: new Date().toISOString(),
        dias_semana:  nuevasDias,
      })
      .eq('id_usuario', idUsuario)
      .select()
      .single()

    if (err) return { ok: false, error: 'Error al actualizar la racha.' }

    setRacha(actualizada)
    return { ok: true, yaContado: false, racha: actualizada }
  }

  // ---------------------------------------------------- estado derivado
  const actividadHoy = racha
    ? new Date(racha.ultima_fecha).toISOString().split('T')[0] === hoy()
    : false

  const semanaVisual = Array.from({ length: 7 }, (_, i) =>
    racha?.dias_semana?.includes(i) ?? false
  )

  return {
    racha,
    cargando,
    error,
    actividadHoy,
    semanaVisual,
    registrarActividad,
    recargar: cargarRacha,
  }
}
