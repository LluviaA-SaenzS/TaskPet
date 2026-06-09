// useAuth.js
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const LS_KEYS_POR_LIMPIAR = ['tp_habitos_dia']

function limpiarStorageDeUsuario() {
  LS_KEYS_POR_LIMPIAR.forEach((k) => localStorage.removeItem(k))
}

function traducirError(mensaje = '') {
  if (mensaje.includes('Invalid login credentials'))
    return 'Usuario o contraseña incorrectos.'
  if (mensaje.includes('already registered') || mensaje.includes('User already registered'))
    return 'El correo ya está registrado.'
  if (mensaje.includes('Password should be at least'))
    return 'La contraseña debe tener al menos 6 caracteres.'
  if (mensaje.includes('Unable to validate email') || mensaje.includes('invalid email'))
    return 'El formato del correo no es válido.'
  if (mensaje.includes('Email not confirmed'))
    return 'Debes confirmar tu correo antes de iniciar sesión.'
  if (mensaje.includes('Network'))
    return 'Error de conexión. Verifica tu internet.'
  return 'Ocurrió un error inesperado. Intenta de nuevo.'
}

export function useAuth() {
  const navigate = useNavigate()
  const [usuarioActivo, setUsuarioActivo] = useState(null)
  const [cargando,      setCargando]      = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuarioActivo(session?.user ?? null)
      setCargando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, session) => {
      const nuevoUsuario = session?.user ?? null
      setUsuarioActivo((prev) => {
        if (prev?.id !== nuevoUsuario?.id) limpiarStorageDeUsuario()
        return nuevoUsuario
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(usuario, contrasena) {
    // Buscar el correo asociado al nombre de usuario
    const { data: perfil, error: errorBusqueda } = await supabase
      .from('usuarios')
      .select('correo')
      .eq('usuario', usuario)
      .maybeSingle()

    if (errorBusqueda || !perfil) {
      return { ok: false, error: 'Usuario o contraseña incorrectos.' }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email:    perfil.correo,
      password: contrasena,
    })

    if (error) return { ok: false, error: traducirError(error.message) }

    navigate('/inicio')
    return { ok: true }
  }

  async function registro(usuario, correo, contrasena) {
    if (!usuario || !correo || !contrasena) {
      return { ok: false, error: 'Por favor completa todos los campos.' }
    }

    const { error: errorAuth } = await supabase.auth.signUp({
      email:    correo,
      password: contrasena,
      options:  { data: { usuario, correo } },
    })

    if (errorAuth) return { ok: false, error: traducirError(errorAuth.message) }

    navigate('/inicio')
    return { ok: true }
  }

  async function logout() {
    limpiarStorageDeUsuario()
    await supabase.auth.signOut()
    setUsuarioActivo(null)
    navigate('/')
  }

  return {
    usuarioActivo,
    estaLogueado: usuarioActivo !== null,
    cargando,
    login,
    registro,
    logout,
  }
}