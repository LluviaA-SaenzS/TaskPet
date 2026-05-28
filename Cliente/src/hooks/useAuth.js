// logica del auth con Supabase
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const navigate = useNavigate()
  const [usuarioActivo, setUsuarioActivo] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // ------------------------------------------------------ Checa si hay una sesion activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuarioActivo(session?.user ?? null)
      setCargando(false)
    })

    // ------------------------------------------------------ Escucha cambios de sesion en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, session) => {
      setUsuarioActivo(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // --------------------------------------------------------- INICIAR SESION
  async function login(usuario, contrasena) {
    // Supabase Auth requiere correo, buscamos el correo por nombre de usuario
    const { data: perfil, error: errorBusqueda } = await supabase
      .from('usuarios')
      .select('correo')
      .eq('usuario', usuario)
      .single()

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

  // --------------------------------------------------------- REGISTRARSE
  async function registro(usuario, correo, contrasena) {
  if (!usuario || !correo || !contrasena) {
    return { ok: false, error: 'Por favor completa todos los campos.' }
  }

  const { error: errorAuth } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: {
      data: { usuario, correo } // el trigger lee esto
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

  // --------------------------------------------------------- CERRAR SESION
  async function logout() {
    await supabase.auth.signOut()
    setUsuarioActivo(null)
    navigate('/')
  }

  const estaLogueado = usuarioActivo !== null

  return { usuarioActivo, estaLogueado, cargando, login, registro, logout }
}