// logica de racha diaria
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ---------------------------------------------------------------- helpers de fecha
function hoy() {
  return new Date().toISOString().split('T')[0] // "2025-05-27"
}

function ayer() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0] // "2025-05-26"
}

// ---------------------------------------------------------------- hook
export function useStreak(idUsuario) {
  const [racha, setRacha] = useState(null)   // { id_racha, acumulado, maxima, ultima_fecha }
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // ---------------------------------------------------- cargar racha desde Supabase
  const cargarRacha = useCallback(async () => {
    if (!idUsuario) return

    setCargando(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('rachas')
      .select('*')
      .eq('id_usuario', idUsuario)
      .single()

    if (err && err.code !== 'PGRST116') { // PGRST116 = no rows found
      setError('Error al cargar la racha.')
      setCargando(false)
      return
    }

    if (!data) {
      // Primera vez del usuario — crear registro inicial
      const { data: nueva, error: errCrear } = await supabase
        .from('rachas')
        .insert({ id_usuario: idUsuario, acumulado: 0, maxima: 0, ultima_fecha: new Date().toISOString() })
        .select()
        .single()

      if (errCrear) {
        setError('Error al crear la racha.')
        setCargando(false)
        return
      }

      setRacha(nueva)
    } else {
      // Verificar si la racha se rompió (no hubo actividad ayer ni hoy)
      const ultimaFecha = new Date(data.ultima_fecha).toISOString().split('T')[0]
      const seRompio = ultimaFecha !== hoy() && ultimaFecha !== ayer()

      if (seRompio && data.acumulado > 0) {
        // Resetear racha rota
        const { data: reseteada, error: errReset } = await supabase
          .from('rachas')
          .update({ acumulado: 0, ultima_fecha: new Date().toISOString() })
          .eq('id_usuario', idUsuario)
          .select()
          .single()

        if (!errReset) {
          setRacha(reseteada)
          setCargando(false)
          return
        }
      }

      setRacha(data)
    }

    setCargando(false)
  }, [idUsuario])

  useEffect(() => {
    cargarRacha()
  }, [cargarRacha])

  // ---------------------------------------------------- registrar actividad del dia
  // Llamar esto cuando el usuario completa una tarea o registra un habito
  async function registrarActividad() {
    if (!idUsuario || !racha) return { ok: false, error: 'No hay racha cargada.' }

    const ultimaFecha = new Date(racha.ultima_fecha).toISOString().split('T')[0]

    // Ya se registró actividad hoy — no sumar de nuevo
    if (ultimaFecha === hoy()) {
      return { ok: true, yaContado: true }
    }

    // Calcular nuevo acumulado
    // Si la ultima actividad fue ayer: continuar racha
    // Si fue antes de ayer: ya se rompió (cargarRacha lo resetea, pero por si acaso)
    const continua = ultimaFecha === ayer()
    const nuevoAcumulado = continua ? racha.acumulado + 1 : 1
    const nuevaMaxima = Math.max(nuevoAcumulado, racha.maxima)

    const { data: actualizada, error: err } = await supabase
      .from('rachas')
      .update({
        acumulado: nuevoAcumulado,
        maxima: nuevaMaxima,
        ultima_fecha: new Date().toISOString(),
      })
      .eq('id_usuario', idUsuario)
      .select()
      .single()

    if (err) {
      return { ok: false, error: 'Error al actualizar la racha.' }
    }

    setRacha(actualizada)
    return { ok: true, yaContado: false, racha: actualizada }
  }

  // ---------------------------------------------------- estado derivado
  const actividadHoy = racha
    ? new Date(racha.ultima_fecha).toISOString().split('T')[0] === hoy()
    : false

  return {
    racha,           // { id_racha, acumulado, maxima, ultima_fecha }
    cargando,
    error,
    actividadHoy,    // boolean — ya completó algo hoy?
    registrarActividad,
    recargar: cargarRacha,
  }
}
