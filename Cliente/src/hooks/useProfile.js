// resuelve id_usuario y usuario desde el UUID de Supabase Auth
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProfile(usuarioActivo) {
  const [perfil, setPerfil] = useState(null)   // { id_usuario, usuario }
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargarPerfil = useCallback(async () => {
    if (!usuarioActivo) {
      setPerfil(null)
      setCargando(false)
      return
    }

    setCargando(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('usuarios')
      .select('id_usuario, usuario')
      .eq('id_auth', usuarioActivo.id)
      .single()

    if (err) {
      setError('Error al cargar el perfil.')
      setCargando(false)
      return
    }

    setPerfil(data)
    setCargando(false)
  }, [usuarioActivo])

  useEffect(() => {
    cargarPerfil()
  }, [cargarPerfil])

  return {
    perfil,        // { id_usuario, usuario }
    cargando,
    error,
    recargar: cargarPerfil,
  }
}
