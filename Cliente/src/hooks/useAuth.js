// logica del auth con Supabase
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const LS_KEYS_POR_LIMPIAR = ['tp_habitos_dia']

function limpiarStorageDeUsuario() {
  LS_KEYS_POR_LIMPIAR.forEach((k) => localStorage.removeItem(k))
}

export function useAuth() {
  const navigate = useNavigate()
  const [usuarioActivo, setUsuarioActivo] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuarioActivo(session?.user ?? null)
      setCargando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, session) => {
      const nuevoUsuario = session?.user ?? null

      // Si cambió el usuario (incluyendo logout → login con otra cuenta),
      // limpiar datos locales del usuario anterior
      setUsuarioActivo((prev) => {
        if (prev?.id !== nuevoUsuario?.id) {
          limpiarStorageDeUsuario()
        }
        return nuevoUsuario
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(usuario, contrasena) {
    const { data: perfil, error: errorBusqueda } = await supabase
      .from('usuarios')
      .select('correo, usuario')
      .eq('usuario', usuario)
      .maybeSingle()

    if (errorBusqueda || !perfil) {
      return { ok: false, error: 'Usuario o contraseña incorrectos.' }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: perfil.correo,
      password: contrasena,
    })

    if (error) {
      return { ok: false, error: 'Usuario o contraseña incorrectos.' }
    }

    navigate('/inicio')
    return { ok: true }
  }

  async function registro(usuario, correo, contrasena) {
    if (!usuario || !correo || !contrasena) {
      return { ok: false, error: 'Por favor completa todos los campos.' }
    }

    const { error: errorAuth } = await supabase.auth.signUp({
      email: correo,
      password: contrasena,
      options: {
        data: { usuario, correo }
      }
    })

    if (errorAuth) {
      if (errorAuth.message.includes('already registered')) {
        return { ok: false, error: 'El correo ya está registrado.' }
      }
      return { ok: false, error: errorAuth.message }
    }

    navigate('/inicio')
    return { ok: true }
  }

  async function logout() {
    limpiarStorageDeUsuario()
    await supabase.auth.signOut()
    setUsuarioActivo(null)
    navigate('/')
  }

  const estaLogueado = usuarioActivo !== null

  return { usuarioActivo, estaLogueado, cargando, login, registro, logout }
}
