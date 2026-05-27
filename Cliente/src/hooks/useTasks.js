// logica de tareas con Supabase
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks(idUsuario) {
  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // ---------------------------------------------------- cargar tareas
  const cargarTareas = useCallback(async () => {
    if (!idUsuario) return

    setCargando(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('tareas')
      .select('*')
      .eq('id_usuario', idUsuario)
      .order('fecha_limite', { ascending: true, nullsFirst: false })

    if (err) {
      setError('Error al cargar las tareas.')
      setCargando(false)
      return
    }

    setTareas(data ?? [])
    setCargando(false)
  }, [idUsuario])

  useEffect(() => {
    cargarTareas()
  }, [cargarTareas])

  // ---------------------------------------------------- agregar tarea
  async function agregarTarea({ titulo, descripcion = '', fechaLimite = null, prioridad = 1 }) {
    if (!titulo?.trim()) {
      return { ok: false, error: 'El título es obligatorio.' }
    }

    const { data, error: err } = await supabase
      .from('tareas')
      .insert({
        id_usuario:   idUsuario,
        titulo:       titulo.trim(),
        descripcion:  descripcion.trim(),
        fecha_limite: fechaLimite,
        prioridad,
        estado:       false,
      })
      .select()
      .single()

    if (err) {
      return { ok: false, error: 'Error al crear la tarea.' }
    }

    // Actualizar estado local sin recargar todo
    setTareas((prev) => [...prev, data])
    return { ok: true, tarea: data }
  }

  // ---------------------------------------------------- editar tarea
  async function editarTarea(idTarea, cambios) {
    const camposPermitidos = ['titulo', 'descripcion', 'fecha_limite', 'prioridad', 'estado']
    const payload = {}

    for (const campo of camposPermitidos) {
      if (cambios[campo] !== undefined) {
        payload[campo] = cambios[campo]
      }
    }

    if (Object.keys(payload).length === 0) {
      return { ok: false, error: 'No hay cambios para guardar.' }
    }

    const { data, error: err } = await supabase
      .from('tareas')
      .update(payload)
      .eq('id_tarea', idTarea)
      .eq('id_usuario', idUsuario) // seguridad: solo edita las propias
      .select()
      .single()

    if (err) {
      return { ok: false, error: 'Error al editar la tarea.' }
    }

    setTareas((prev) => prev.map((t) => (t.id_tarea === idTarea ? data : t)))
    return { ok: true, tarea: data }
  }

  // ---------------------------------------------------- completar / descompletar tarea
  async function toggleTarea(idTarea) {
    const tarea = tareas.find((t) => t.id_tarea === idTarea)
    if (!tarea) return { ok: false, error: 'Tarea no encontrada.' }

    return editarTarea(idTarea, { estado: !tarea.estado })
  }

  // ---------------------------------------------------- eliminar tarea
  async function eliminarTarea(idTarea) {
    const { error: err } = await supabase
      .from('tareas')
      .delete()
      .eq('id_tarea', idTarea)
      .eq('id_usuario', idUsuario) // seguridad: solo elimina las propias

    if (err) {
      return { ok: false, error: 'Error al eliminar la tarea.' }
    }

    setTareas((prev) => prev.filter((t) => t.id_tarea !== idTarea))
    return { ok: true }
  }

  // ---------------------------------------------------- estado derivado
  const tareasPendientes  = tareas.filter((t) => !t.estado)
  const tareasCompletadas = tareas.filter((t) => t.estado)
  const totalTareas       = tareas.length

  return {
    tareas,             // todas las tareas
    tareasPendientes,   // solo las no completadas
    tareasCompletadas,  // solo las completadas
    totalTareas,
    cargando,
    error,
    agregarTarea,
    editarTarea,
    toggleTarea,        // cambia estado true/false
    eliminarTarea,
    recargar: cargarTareas,
  }
}
