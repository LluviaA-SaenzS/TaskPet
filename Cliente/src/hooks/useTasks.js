// useTasks.js
// - prioridad: int calculado desde fecha_limite (0=hoy/mañana, 1=semana, 2=mes, 3=después/sin fecha)
// - estado: bool (false=pendiente, true=completada)
// - archivada: bool (true = no aparece nunca más)
// - completada_en: timestamptz — cuando se marcó como hecha
// Lista normal: estado=false, archivada=false, orden por prioridad ASC
// Filtro "Completadas": estado=true, archivada=false
// Al cargar: archiva las completadas con más de 7 días

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const DIAS_HASTA_ARCHIVAR = 7

// ── Calcula prioridad desde fecha_limite ──────────────────────────────────────
function calcularPrioridad(fecha_limite) {
  if (!fecha_limite) return 3

  const hoy    = new Date()
  hoy.setHours(0, 0, 0, 0)
  const limite = new Date(fecha_limite)
  limite.setHours(0, 0, 0, 0)

  const diffDias = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24))

  if (diffDias <= 1)  return 0  // hoy o mañana
  if (diffDias <= 7)  return 1  // esta semana
  if (diffDias <= 30) return 2  // este mes
  return 3                      // más lejos
}

export function useTasks(idUsuario) {
  const [tareas,    setTareas]    = useState([])
  const [cargando,  setCargando]  = useState(false)
  const [error,     setError]     = useState(null)

  // ── Archivar las completadas con >7 días (corre silenciosamente al montar) ──

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

  // ── Cargar ─────────────────────────────────────────────────────────────────
  // Trae pendientes + completadas no archivadas; el filtro se hace en memoria

  const cargarTareas = useCallback(async () => {
    if (!idUsuario) return
    setCargando(true)
    setError(null)

    // Primero limpiar
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

  // ── Crear ──────────────────────────────────────────────────────────────────

  const crearTarea = useCallback(async (formData) => {
    if (!idUsuario) return { ok: false, error: 'Sin usuario' }

    const {
      titulo,
      descripcion  = '',
      fecha_inicio,
      fecha_limite,
      etiquetas    = [],
    } = formData

    const prioridad = calcularPrioridad(fecha_limite)

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

    // Insertar evento paralelo para el calendario
    const { error: errEvento } = await supabase
      .from('eventos')
      .insert({
        id_usuario:   idUsuario,
        titulo,
        descripcion,
        fecha_inicio: fecha_inicio || null,
        fecha_final:  fecha_limite  || null,
      })

    if (errEvento) console.warn('Tarea creada, fallo evento:', errEvento.message)

    // Insertar en orden de prioridad
    setTareas((prev) => {
      const nueva = [tarea, ...prev]
      return nueva.sort((a, b) => a.prioridad - b.prioridad || 0)
    })

    return { ok: true, tarea }
  }, [idUsuario])

  // ── Editar ─────────────────────────────────────────────────────────────────

  const editarTarea = useCallback(async (idTarea, cambios) => {
    const { fecha_inicio, ...camposTarea } = cambios

    // Recalcular prioridad si cambia fecha_limite
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

    // Actualizar evento si hay campos relevantes
    const camposEvento = {}
    if (cambios.titulo)       camposEvento.titulo       = cambios.titulo
    if (cambios.descripcion)  camposEvento.descripcion  = cambios.descripcion
    if (fecha_inicio)         camposEvento.fecha_inicio = fecha_inicio
    if (cambios.fecha_limite) camposEvento.fecha_final  = cambios.fecha_limite

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

  // ── Toggle hecha ───────────────────────────────────────────────────────────

  const toggleHecha = useCallback(async (idTarea) => {
    const tarea = tareas.find((t) => t.id_tarea === idTarea)
    if (!tarea) return

    const nuevoEstado    = !tarea.estado
    const completada_en  = nuevoEstado ? new Date().toISOString() : null

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
      // Revertir
      setTareas((prev) =>
        prev.map((t) =>
          t.id_tarea === idTarea
            ? { ...t, estado: tarea.estado, completada_en: tarea.completada_en }
            : t
        )
      )
    }
  }, [tareas, idUsuario])

  // ── Archivar manualmente (equivale a "eliminar" para el usuario) ───────────

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

  // ── Eliminar también el evento (usado en archivar) ─────────────────────────

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

  // ── Vistas derivadas (sin ir a Supabase) ──────────────────────────────────

  // Pendientes: estado=false — para la lista principal
  const tareasPendientes = tareas.filter((t) => t.estado === false)

  // Completadas: estado=true — para el filtro especial
  const tareasCompletadas = tareas.filter((t) => t.estado === true)

  // Filtro por etiqueta sobre pendientes
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
