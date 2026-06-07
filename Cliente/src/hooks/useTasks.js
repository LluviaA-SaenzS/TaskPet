// useTasks.js
// Acepta opción `onTareaCompletada` — se llama cuando una tarea se marca como hecha
// Esto permite que useStreak registre actividad sin acoplamiento directo

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const DIAS_HASTA_ARCHIVAR = 7

function calcularPrioridad(fecha_limite) {
  if (!fecha_limite) return 3

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const limite = new Date(fecha_limite)
  limite.setHours(0, 0, 0, 0)

  const diffDias = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24))

  if (diffDias <= 1)  return 0
  if (diffDias <= 7)  return 1
  if (diffDias <= 30) return 2
  return 3
}

export function useTasks(idUsuario, { onTareaCompletada } = {}) {
  const [tareas,   setTareas]   = useState([])
  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState(null)

  const limpiarViejas = useCallback(async () => {
    if (!idUsuario) return
    const corte = new Date()
    corte.setDate(corte.getDate() - DIAS_HASTA_ARCHIVAR)

    await supabase
      .from('tareas')
      .update({ archivada: true })
      .eq('id_usuario', idUsuario)
      .eq('estado', true)
      .eq('archivada', false)
      .lt('completada_en', corte.toISOString())
  }, [idUsuario])

  const cargarTareas = useCallback(async () => {
    if (!idUsuario) return
    setCargando(true)
    setError(null)

    await limpiarViejas()

    const { data, error: err } = await supabase
      .from('tareas')
      .select('*')
      .eq('id_usuario', idUsuario)
      .eq('archivada', false)
      .order('prioridad', { ascending: true })
      .order('created_at', { ascending: false })

    if (err) setError(err.message)
    else     setTareas(data ?? [])

    setCargando(false)
  }, [idUsuario, limpiarViejas])

  useEffect(() => { cargarTareas() }, [cargarTareas])

  const crearTarea = useCallback(async (formData) => {
    if (!idUsuario) return { ok: false, error: 'Sin usuario' }

    const {
      titulo,
      descripcion  = '',
      fecha_inicio,
      hora_inicio  = '',
      fecha_limite,
      hora_fin     = '',
      etiquetas    = [],
    } = formData

    const prioridad = calcularPrioridad(fecha_limite)

    // Armar fecha_inicio completa con hora si se proporcionó
    const fechaInicioCompleta = fecha_inicio
      ? hora_inicio
        ? `${fecha_inicio}T${hora_inicio}:00`
        : fecha_inicio
      : null

    const fechaFinCompleta = fecha_limite
      ? hora_fin
        ? `${fecha_limite}T${hora_fin}:00`
        : fecha_limite
      : null

    const { data: tarea, error: errTarea } = await supabase
      .from('tareas')
      .insert({
        id_usuario:   idUsuario,
        titulo,
        descripcion,
        fecha_limite: fecha_limite || null,
        prioridad,
        estado:       false,
        archivada:    false,
        etiquetas,
      })
      .select()
      .single()

    if (errTarea) return { ok: false, error: errTarea.message }

    const { error: errEvento } = await supabase
      .from('eventos')
      .insert({
        id_usuario:   idUsuario,
        titulo,
        descripcion,
        fecha_inicio: fechaInicioCompleta,
        fecha_final:  fechaFinCompleta,
      })

    if (errEvento) console.warn('Tarea creada, fallo evento:', errEvento.message)

    setTareas((prev) => {
      const nueva = [tarea, ...prev]
      return nueva.sort((a, b) => a.prioridad - b.prioridad || 0)
    })

    return { ok: true, tarea }
  }, [idUsuario])

  const editarTarea = useCallback(async (idTarea, cambios) => {
    const { fecha_inicio, hora_inicio, hora_fin, ...camposTarea } = cambios

    if (camposTarea.fecha_limite !== undefined) {
      camposTarea.prioridad = calcularPrioridad(camposTarea.fecha_limite)
    }

    const { data: actualizada, error: errTarea } = await supabase
      .from('tareas')
      .update(camposTarea)
      .eq('id_tarea', idTarea)
      .eq('id_usuario', idUsuario)
      .select()
      .single()

    if (errTarea) return { ok: false, error: errTarea.message }

    const camposEvento = {}
    if (cambios.titulo)       camposEvento.titulo       = cambios.titulo
    if (cambios.descripcion)  camposEvento.descripcion  = cambios.descripcion
    if (fecha_inicio)         camposEvento.fecha_inicio = hora_inicio
      ? `${fecha_inicio}T${hora_inicio}:00`
      : fecha_inicio
    if (cambios.fecha_limite) camposEvento.fecha_final  = hora_fin
      ? `${cambios.fecha_limite}T${hora_fin}:00`
      : cambios.fecha_limite

    if (Object.keys(camposEvento).length > 0) {
      const { error: errEvento } = await supabase
        .from('eventos')
        .update(camposEvento)
        .eq('id_usuario', idUsuario)
        .eq('titulo', actualizada.titulo)
      if (errEvento) console.warn('Fallo actualizar evento:', errEvento.message)
    }

    setTareas((prev) => {
      const siguiente = prev.map((t) => (t.id_tarea === idTarea ? actualizada : t))
      return siguiente.sort((a, b) => a.prioridad - b.prioridad || 0)
    })

    return { ok: true, tarea: actualizada }
  }, [idUsuario])

  // ── toggleHecha: si la tarea se marca como completada, notifica a useStreak ──
  const toggleHecha = useCallback(async (idTarea) => {
    const tarea = tareas.find((t) => t.id_tarea === idTarea)
    if (!tarea) return

    const nuevoEstado   = !tarea.estado
    const completada_en = nuevoEstado ? new Date().toISOString() : null

    // Optimista
    setTareas((prev) =>
      prev.map((t) =>
        t.id_tarea === idTarea
          ? { ...t, estado: nuevoEstado, completada_en }
          : t
      )
    )

    const { error: err } = await supabase
      .from('tareas')
      .update({ estado: nuevoEstado, completada_en })
      .eq('id_tarea', idTarea)
      .eq('id_usuario', idUsuario)

    if (err) {
      console.error('Error toggle:', err.message)
      setTareas((prev) =>
        prev.map((t) =>
          t.id_tarea === idTarea
            ? { ...t, estado: tarea.estado, completada_en: tarea.completada_en }
            : t
        )
      )
      return
    }

    // Si se marcó como completada (no desmarcada), registrar actividad en la racha
    if (nuevoEstado && typeof onTareaCompletada === 'function') {
      onTareaCompletada()
    }
  }, [tareas, idUsuario, onTareaCompletada])

  const archivarTarea = useCallback(async (idTarea) => {
    const { error: err } = await supabase
      .from('tareas')
      .update({ archivada: true })
      .eq('id_tarea', idTarea)
      .eq('id_usuario', idUsuario)

    if (err) return { ok: false, error: err.message }

    setTareas((prev) => prev.filter((t) => t.id_tarea !== idTarea))
    return { ok: true }
  }, [idUsuario])

  const eliminarTarea = useCallback(async (idTarea) => {
    const tarea = tareas.find((t) => t.id_tarea === idTarea)

    const { error: err } = await supabase
      .from('tareas')
      .update({ archivada: true })
      .eq('id_tarea', idTarea)
      .eq('id_usuario', idUsuario)

    if (err) return { ok: false, error: err.message }

    if (tarea) {
      await supabase
        .from('eventos')
        .delete()
        .eq('id_usuario', idUsuario)
        .eq('titulo', tarea.titulo)
    }

    setTareas((prev) => prev.filter((t) => t.id_tarea !== idTarea))
    return { ok: true }
  }, [tareas, idUsuario])

  const tareasPendientes  = tareas.filter((t) => t.estado === false)
  const tareasCompletadas = tareas.filter((t) => t.estado === true)

  const filtrarPorEtiqueta = useCallback((etiqueta) => {
    if (!etiqueta) return tareasPendientes
    return tareasPendientes.filter(
      (t) => Array.isArray(t.etiquetas) && t.etiquetas.includes(etiqueta)
    )
  }, [tareasPendientes])

  return {
    tareas,
    tareasPendientes,
    tareasCompletadas,
    cargando,
    error,
    cargarTareas,
    crearTarea,
    editarTarea,
    toggleHecha,
    eliminarTarea,
    archivarTarea,
    filtrarPorEtiqueta,
  }
}
