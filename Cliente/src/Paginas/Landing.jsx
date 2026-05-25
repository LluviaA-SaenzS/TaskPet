import { useNavigate } from 'react-router-dom'
import '../Estilos/Landing.css'

export default function Landing() {
  const navigate = useNavigate()

  const features = [ //----------------------------------------------- informacion de las tarjetas
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

      {/* NAVBAR */}
      <nav className="landing-nav">
        <span className="landing-logo">TaskPet <img src='/Logotask.png'></img></span>
        <div className="landing-nav-btns">
          <button className="btn-secundario" onClick={() => navigate('/auth')}>
            Iniciar sesión
          </button>
          <button className="btn-primario" onClick={() => navigate('/auth')}>
            Registrarse
          </button>
        </div>
      </nav>

      {/* HERO */}
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

        {/* Placeholder imagen hero */}
        <div className="hero-imagen">
          <span>🐱</span>
        </div>
      </section>

      {/* FEATURES */}
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

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>© 2025 TaskPet — Hecho con 🐾 y mucho café</p>
      </footer>

    </div>
  )
}
