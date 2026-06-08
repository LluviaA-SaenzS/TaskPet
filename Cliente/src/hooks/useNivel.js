// useNivel.js
// Calcula el nivel de la mascota basado en el historial de hábitos.
//
// Fórmula:
//   totalPuntos = SUM(acumulado) de todos los registros del usuario
//   nivel       = Math.floor(totalPuntos / 100) + 1   (mínimo 1)
//   xpActual    = totalPuntos % 100                   (0-99, para la barra)
//   xpSiguiente = 100
//
// Solo va a Supabase una vez al montar (o cuando cambia idUsuario).
// Se refresca con recargar() después de marcar un hábito.

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const XP_POR_NIVEL = 100

export function useNivel(idUsuario) {
  const [nivel,       setNivel]       = useState(1)
  const [xpActual,    setXpActual]    = useState(0)
  const [xpSiguiente, setXpSiguiente] = useState(XP_POR_NIVEL)
  const [totalPuntos, setTotalPuntos] = useState(0)
  const [cargando,    setCargando]    = useState(true)
  const [error,       setError]       = useState(null)

  const calcularNivel = useCallback(async () => {
    if (!idUsuario) return

    setCargando(true)
    setError(null)

    // Trae todos los registros del usuario y suma acumulado en cliente
    // (Supabase no expone SUM directamente sin RPC, así que sumamos aquí)
    const { data, error: err } = await supabase
      .from('registrar_habitos')
      .select('acumulado')
      .eq('id_usuario', idUsuario)

    if (err) {
      setError('Error al calcular el nivel.')
      setCargando(false)
      return
    }

    const total = (data ?? []).reduce((sum, r) => sum + (r.acumulado ?? 0), 0)

    const nvl    = Math.floor(total / XP_POR_NIVEL) + 1
    const xp     = total % XP_POR_NIVEL
    const xpSig  = XP_POR_NIVEL

    setTotalPuntos(total)
    setNivel(nvl)
    setXpActual(xp)
    setXpSiguiente(xpSig)
    setCargando(false)
  }, [idUsuario])

  useEffect(() => {
    calcularNivel()
  }, [calcularNivel])

  // Porcentaje de la barra de XP (0-100)
  const pctXp = Math.round((xpActual / xpSiguiente) * 100)

  return {
    nivel,        // número entero >= 1
    xpActual,     // puntos dentro del nivel actual (0-99)
    xpSiguiente,  // puntos para el siguiente nivel (siempre 100)
    pctXp,        // 0-100, para la barra de progreso
    totalPuntos,  // acumulado histórico total
    cargando,
    error,
    recargar: calcularNivel,
  }
}
