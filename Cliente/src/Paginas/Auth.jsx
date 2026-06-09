// Auth.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../Estilos/Auth.css'

export default function Auth() {
  const navigate = useNavigate()
  const { login, registro } = useAuth()
  const [tab, setTab] = useState('login')

  const [loginForm,    setLoginForm]    = useState({ usuario: '', contrasena: '' })
  const [registroForm, setRegistroForm] = useState({ usuario: '', correo: '', contrasena: '' })
  const [error,        setError]        = useState('')
  const [enviando,     setEnviando]     = useState(false)

  function handleLoginChange(e) {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
  }

  function handleRegistroChange(e) {
    setRegistroForm({ ...registroForm, [e.target.name]: e.target.value })
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    const resultado = await login(loginForm.usuario, loginForm.contrasena)
    setEnviando(false)
    if (!resultado.ok) setError(resultado.error)
  }

  async function handleRegistro(e) {
    e.preventDefault()
    setError('')

    // Validación local antes de llamar Supabase
    if (registroForm.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setEnviando(true)
    const resultado = await registro(registroForm.usuario, registroForm.correo, registroForm.contrasena)
    setEnviando(false)
    if (!resultado.ok) setError(resultado.error)
  }

  return (
    <div className="auth-fondo">
      <div className="auth-tarjeta">

        <div className="auth-logo">TaskPet 🐾</div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'activo' : ''}`}
            onClick={() => { setTab('login'); setError('') }}
          >
            Iniciar sesión
          </button>
          <button
            className={`auth-tab ${tab === 'registro' ? 'activo' : ''}`}
            onClick={() => { setTab('registro'); setError('') }}
          >
            Registrarse
          </button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        {tab === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <label>Usuario</label>
            <input
              type="text"
              name="usuario"
              placeholder="tu_usuario"
              value={loginForm.usuario}
              onChange={handleLoginChange}
              required
            />
            <label>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              placeholder="••••••••"
              value={loginForm.contrasena}
              onChange={handleLoginChange}
              required
            />
            <button type="submit" className="auth-btn" disabled={enviando}>
              {enviando ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        )}

        {tab === 'registro' && (
          <form className="auth-form" onSubmit={handleRegistro}>
            <label>Usuario</label>
            <input
              type="text"
              name="usuario"
              placeholder="tu_usuario"
              value={registroForm.usuario}
              onChange={handleRegistroChange}
              required
            />
            <label>Correo</label>
            <input
              type="email"
              name="correo"
              placeholder="correo@ejemplo.com"
              value={registroForm.correo}
              onChange={handleRegistroChange}
              required
            />
            <label>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              placeholder="••••••••"
              value={registroForm.contrasena}
              onChange={handleRegistroChange}
              required
            />
            <button type="submit" className="auth-btn" disabled={enviando}>
              {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        )}

        <button className="auth-volver" onClick={() => navigate('/')}>
          Volver al inicio
        </button>

      </div>
    </div>
  )
}
