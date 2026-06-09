// usePet.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const INTERVALO_DECAY_MS = 5 * 60 * 1000  // cada 5 minutos
const DECAY_POR_TICK     = 5               // baja 2 puntos por tick en cada stat

const STATS = ['salud', 'hambre', 'sed', 'sueno', 'animo']

function clamp(valor) {
  return Math.min(100, Math.max(0, valor))
}

export function usePet(idUsuario) {
  const [mascota,  setMascota]  = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)

  // Ref que siempre tiene el valor actual de mascota
  // — evita el closure stale en el intervalo
  const mascotaRef   = useRef(null)
  const intervaloRef = useRef(null)

  useEffect(() => { mascotaRef.current = mascota }, [mascota])

  // ── Cargar mascota ────────────────────────────────────────────────────────

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

  // ── Decay simple por tiempo ───────────────────────────────────────────────
  // Lee mascotaRef.current en cada tick para tener siempre el valor fresco

  useEffect(() => {
    if (!idUsuario) return

    if (intervaloRef.current) clearInterval(intervaloRef.current)

    intervaloRef.current = setInterval(async () => {
      const actual = mascotaRef.current
      if (!actual) return

      const statsActualizados = {}
      for (const stat of STATS) {
        statsActualizados[stat] = clamp(actual[stat] - DECAY_POR_TICK)
      }

      const { data, error: err } = await supabase
        .from('mascotas')
        .update({ ...statsActualizados, ultimo_decay: new Date().toISOString() })
        .eq('id_mascota', actual.id_mascota)
        .eq('id_usuario', idUsuario)
        .select()
        .single()

      if (!err && data) {
        setMascota(data)
      }
    }, INTERVALO_DECAY_MS)

    return () => clearInterval(intervaloRef.current)
  }, [idUsuario]) // solo depende de idUsuario — mascota se lee del ref

  // ── Crear mascota ─────────────────────────────────────────────────────────

  async function crearMascota(nombre) {
    if (!nombre?.trim()) return { ok: false, error: 'El nombre es obligatorio.' }

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
      })
      .select()
      .single()

    if (err) return { ok: false, error: 'Error al crear la mascota.' }

    setMascota(data)
    return { ok: true, mascota: data }
  }

  // ── Subir stat al registrar hábito ────────────────────────────────────────

  async function subirStatPorHabito(statObjetivo, cantidad) {
    if (!mascota) return { ok: false, error: 'No hay mascota cargada.' }
    if (!STATS.includes(statObjetivo)) return { ok: false, error: `Stat inválido: ${statObjetivo}` }

    const nuevoValor = clamp(mascota[statObjetivo] + cantidad)

    const { data, error: err } = await supabase
      .from('mascotas')
      .update({ [statObjetivo]: nuevoValor })
      .eq('id_mascota', mascota.id_mascota)
      .eq('id_usuario', idUsuario)
      .select()
      .single()

    if (err) return { ok: false, error: 'Error al actualizar el stat.' }

    setMascota(data)
    return { ok: true, mascota: data }
  }

  // ── Renombrar mascota ─────────────────────────────────────────────────────

  async function renombrarMascota(nuevoNombre) {
    if (!nuevoNombre?.trim()) return { ok: false, error: 'El nombre es obligatorio.' }

    const { data, error: err } = await supabase
      .from('mascotas')
      .update({ nombre: nuevoNombre.trim() })
      .eq('id_mascota', mascota.id_mascota)
      .eq('id_usuario', idUsuario)
      .select()
      .single()

    if (err) return { ok: false, error: 'Error al renombrar la mascota.' }

    setMascota(data)
    return { ok: true, mascota: data }
  }

  return {
    mascota,
    cargando,
    error,
    estaViva:    mascota ? mascota.salud > 0 : false,
    statCritico: mascota ? STATS.find((s) => mascota[s] <= 20) ?? null : null,
    crearMascota,
    subirStatPorHabito,
    renombrarMascota,
    recargar: cargarMascota,
  }
}