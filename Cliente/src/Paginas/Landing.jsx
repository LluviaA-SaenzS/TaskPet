import { useNavigate } from 'react-router-dom'
import logoTask from '../assets/Logotask.svg'   // ← importar como módulo
import '../Estilos/Landing.css'

export default function Landing() {
  const navigate = useNavigate()

  const features = [
    {
      emoji: '🐾',
      titulo: 'Tu mascota crece contigo',
      desc: 'Completa tareas y ve cómo tu mascota virtual evoluciona día a día.',
    },
    {
      emoji: '✅',
      titulo: 'Organiza tus pendientes',
      desc: 'Crea, edita y completa tareas de forma sencilla y visual.',
    },
    {
      emoji: '📅',
      titulo: 'Planea tu semana',
      desc: 'Usa el calendario para distribuir tus tareas y nunca olvidar nada.',
    },
  ]

  return (
    <div className="landing">

      <nav className="landing-nav">
        <span className="landing-logo">TaskPet</span>
        <div className="landing-nav-btns">
          <button className="btn-secundario" onClick={() => navigate('/auth')}>
            Iniciar sesión
          </button>
          <button className="btn-primario" onClick={() => navigate('/auth')}>
            Registrarse
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <h1 className="hero-titulo">
          Completa tareas,<br />
          <span className="hero-acento">cuida tu mascota</span>
        </h1>
        <p className="hero-desc">
          TaskPet convierte tu productividad en una aventura. Organiza tu día
          y gana recompensas para tu compañero virtual.
        </p>
        <div className="hero-btns">
          <button className="btn-primario btn-grande" onClick={() => navigate('/auth')}>
            Empezar gratis
          </button>
          <button className="btn-secundario btn-grande" onClick={() => navigate('/auth')}>
            Ya tengo cuenta
          </button>
        </div>

        <div className="hero-imagen">
          {/* logoTask es ahora una URL resuelta por Vite — funciona en Vercel */}
          <img src={logoTask} alt="TaskPet logo" />
        </div>
      </section>

      <section className="landing-features">
        <h2 className="features-titulo">¿Qué puedes hacer?</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.titulo}>
              <span className="feature-emoji">{f.emoji}</span>
              <h3>{f.titulo}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2026 TaskPet — Hecho con 🐾 y mucho café</p>
      </footer>

    </div>
  )
}
