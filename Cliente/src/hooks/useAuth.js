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

    // 1. Crear cuenta en Supabase Auth
    const { data, error: errorAuth } = await supabase.auth.signUp({
      email: correo,
      password: contrasena,
    })

    if (errorAuth) {
      if (errorAuth.message.includes('already registered')) {
        return { ok: false, error: 'El correo ya está registrado.' }
      }
      return { ok: false, error: errorAuth.message }
    }

    // 2. Guardar nombre de usuario en tabla publica usuarios
    const { error: errorPerfil } = await supabase
      .from('usuarios')
      .insert({ id_auth: data.user.id, usuario, correo })

    if (errorPerfil) {
      if (errorPerfil.code === '23505') { // unique violation
        return { ok: false, error: 'El usuario o correo ya están registrados.' }
      }
      return { ok: false, error: 'Error al crear el perfil.' }
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