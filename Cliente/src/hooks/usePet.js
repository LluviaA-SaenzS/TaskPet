// logica de mascota con Supabase 
// MODIFICAR PARA AJUSTAR A NUESTRA BASE DE DATOS
// Meter imagen default al crear mascota
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const INTERVALO_DECAY_MS = 5 * 60 * 1000 // 5 minutos

// Stats validos de la mascota
const STATS = ['salud', 'hambre', 'sed', 'sueno', 'animo']

// Clampea un valor entre 0 y 100
function clamp(valor) {
  return Math.min(100, Math.max(0, valor))
}

// ---------------------------------------------------------------- hook
export function usePet(idUsuario, { decayPorPrioridad = {}, tareasPendientes = [] } = {}) {
  // decayPorPrioridad ejemplo: { 1: 1, 2: 2, 3: 3 }
  // tareasPendientes: arreglo de tareas sin completar del useTasks hook

  const [mascota, setMascota] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const intervaloRef = useRef(null)

  // ---------------------------------------------------- cargar mascota
  const cargarMascota = useCallback(async () => {
    
    if (!idUsuario) return

    setCargando(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('mascotas')
      .select('*')
      .eq('id_usuario', idUsuario)
      .single()
      

    if (err && err.code !== 'PGRST116') {
      setError('Error al cargar la mascota.')
      setCargando(false)
      return
    }

    setMascota(data ?? null)
    setCargando(false)
  }, [idUsuario])

  useEffect(() => {
    cargarMascota()
  }, [cargarMascota])

  // ---------------------------------------------------- crear mascota
  async function crearMascota(nombre) {
    if (!nombre?.trim()) {
      return { ok: false, error: 'El nombre es obligatorio.' }
    }

    const { data, error: err } = await supabase
      .from('mascotas')
      .insert({
        id_usuario:   idUsuario,
        nombre:       nombre.trim(),
        salud:        100,
        hambre:       100,
        sed:          100,
        sueno:        100,
        animo:        100,
        ultimo_decay: new Date().toISOString(),
        //imagen_url:   null,
      })
      .select()
      .single()

    if (err) {
      return { ok: false, error: 'Error al crear la mascota.' }
    }

    setMascota(data)
    return { ok: true, mascota: data }
  }

  // ---------------------------------------------------- calcular decay segun tareas pendientes
  function calcularDecay() {
    if (!tareasPendientes.length) return 0

    // Sumar el decay total segun la prioridad de cada tarea pendiente
    return tareasPendientes.reduce((total, tarea) => {
      const bajada = decayPorPrioridad[tarea.prioridad] ?? 1
      return total + bajada
    }, 0)
  }

  // ---------------------------------------------------- aplicar decay a todos los stats
  async function aplicarDecay() {
    if (!mascota || !idUsuario) return

    const decay = calcularDecay()
    if (decay === 0) return // sin tareas pendientes, no hay decay

    const statsActualizados = {}
    for (const stat of STATS) {
      statsActualizados[stat] = clamp(mascota[stat] - decay)
    }

    const { data, error: err } = await supabase
      .from('mascotas')
      .update({ ...statsActualizados, ultimo_decay: new Date().toISOString() })
      .eq('id_mascota', mascota.id_mascota)
      .eq('id_usuario', idUsuario)
      .select()
      .single()

    if (!err) {
      setMascota(data)
    }
  }

  // ---------------------------------------------------- iniciar decay en segundo plano
  useEffect(() => {
    if (!mascota) return

    // Limpiar intervalo anterior si existe
    if (intervaloRef.current) clearInterval(intervaloRef.current)

    intervaloRef.current = setInterval(() => {
      aplicarDecay()
    }, INTERVALO_DECAY_MS)

    return () => clearInterval(intervaloRef.current)
  }, [mascota, tareasPendientes, decayPorPrioridad]) // re-arranca si cambian las tareas

  // ---------------------------------------------------- subir stat al registrar habito
  // statObjetivo: cual stat sube ('hambre', 'animo', etc.)
  // cantidad: cuanto sube (viene de habito.unidad)
  async function subirStatPorHabito(statObjetivo, cantidad) {
    if (!mascota) return { ok: false, error: 'No hay mascota cargada.' }
    if (!STATS.includes(statObjetivo)) {
      return { ok: false, error: `Stat inválido: ${statObjetivo}` }
    }

    const nuevoValor = clamp(mascota[statObjetivo] + cantidad)

    const { data, error: err } = await supabase
      .from('mascotas')
      .update({ [statObjetivo]: nuevoValor })
      .eq('id_mascota', mascota.id_mascota)
      .eq('id_usuario', idUsuario)
      .select()
      .single()

    if (err) {
      return { ok: false, error: 'Error al actualizar el stat.' }
    }

    setMascota(data)
    return { ok: true, mascota: data }
  }

  // ---------------------------------------------------- actualizar nombre
  async function renombrarMascota(nuevoNombre) {
    if (!nuevoNombre?.trim()) {
      return { ok: false, error: 'El nombre es obligatorio.' }
    }

    const { data, error: err } = await supabase
      .from('mascotas')
      .update({ nombre: nuevoNombre.trim() })
      .eq('id_mascota', mascota.id_mascota)
      .eq('id_usuario', idUsuario)
      .select()
      .single()

    if (err) {
      return { ok: false, error: 'Error al renombrar la mascota.' }
    }

    setMascota(data)
    return { ok: true, mascota: data }
  }

  // ---------------------------------------------------- estado derivado
  const estaViva = mascota ? mascota.salud > 0 : false
  const statCritico = mascota
    ? STATS.find((s) => mascota[s] <= 20) ?? null // primer stat en estado critico
    : null

  return {
    mascota,          // { id_mascota, nombre, salud, hambre, sed, sueno, animo, ultimo_decay }
    cargando,
    error,
    estaViva,
    statCritico,      // string del stat mas bajo en critico, o null
    crearMascota,
    subirStatPorHabito,
    renombrarMascota,
    recargar: cargarMascota,
  }
}
