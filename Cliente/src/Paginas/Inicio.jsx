import '../Estilos/Inicio.css'
<<<<<<< HEAD
=======

/* ─── SVG del perrito (estilo cartoon/flat) ─── */
>>>>>>> 28ca55dccc83d724f0e21b5c69797fd3104eaf7c
function PetDogSVG() {
  return (
    <svg viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Orejas */}
      <ellipse cx="33" cy="50" rx="15" ry="19" fill="#2d2d2d" transform="rotate(-8 33 50)" />
      <ellipse cx="87" cy="50" rx="15" ry="19" fill="#2d2d2d" transform="rotate(8 87 50)" />
      {/* Cabeza */}
      <ellipse cx="60" cy="57" rx="33" ry="29" fill="#f5f0e8" />
      {/* Parche oscuro izquierdo */}
      <ellipse cx="43" cy="49" rx="13" ry="15" fill="#2d2d2d" />
      {/* Ojos */}
      <circle cx="46" cy="49" r="6.5" fill="white" />
      <circle cx="74" cy="49" r="6.5" fill="white" />
      <circle cx="47" cy="50" r="3.8" fill="#111" />
      <circle cx="75" cy="50" r="3.8" fill="#111" />
      <circle cx="48.5" cy="48" r="1.4" fill="white" />
      <circle cx="76.5" cy="48" r="1.4" fill="white" />
      {/* Nariz */}
      <ellipse cx="60" cy="62" rx="7" ry="5" fill="#111" />
      <ellipse cx="58" cy="61" rx="2" ry="1.5" fill="white" opacity=".45" />
      {/* Boca */}
      <path d="M54 67 Q60 73 66 67" stroke="#111" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Cuerpo */}
      <rect x="34" y="82" width="52" height="36" rx="18" fill="#f5f0e8" />
      {/* Parche cuerpo */}
      <ellipse cx="42" cy="93" rx="9" ry="11" fill="#2d2d2d" />
      {/* Corbatín */}
      <polygon points="60,79 53,85 60,82 67,85" fill="#ff6b35" />
      <circle cx="60" cy="82" r="3" fill="#cc4422" />
      {/* Patas */}
      <rect x="37" y="112" width="16" height="11" rx="8" fill="#f5f0e8" />
      <rect x="67" y="112" width="16" height="11" rx="8" fill="#f5f0e8" />
    </svg>
<<<<<<< HEAD
=======
  )
}

/* ─── Iconos del nav ─── */
const IconPendientes = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
  </svg>
)
const IconMascota = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="4.5" cy="9" r="2"/><circle cx="9" cy="5.5" r="2"/>
    <circle cx="15" cy="5.5" r="2"/><circle cx="19.5" cy="9" r="2"/>
    <path d="M12 22C8.5 22 4 19.5 4 14c0-3 2.5-5 5-5h6c2.5 0 5 2 5 5 0 5.5-4.5 8-8 8z"/>
  </svg>
)
const IconCalendario = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

/* ─── Datos de los días ─── */
const DIAS = [
  { label: 'D', done: false },
  { label: 'L', done: false },
  { label: 'M', done: false },
  { label: 'M', done: true  },
  { label: 'J', done: true  },
  { label: 'V', done: 'hoy' },
  { label: 'S', done: false },
]

function App() {
  return (
    <div className="layout">

      {/* ── Header ── */}
      <header className="app-header">
      
        <nav className="pill-nav">
          <ul>
            <li>
              <a href="#" className="active">
                <IconPendientes />
                <span className="nav-label">Pendientes</span>
              </a>
            </li>
            <li>
              <a href="#">
                <IconMascota />
                <span className="nav-label">Mascota</span>
              </a>
            </li>
            <li>
              <a href="#">
                <IconCalendario />
                <span className="nav-label">Calendario</span>
              </a>
            </li>
          </ul>
        </nav>

    </header>

      {/* ── Cuerpo ── */}
      <div className="page-body">

        {/* Sidebar usuario */}
        <aside className="sidebar">
          <p className="greeting">¡Hola!</p>

          <div className="img-perfil">
            <div className="img-perfil-placeholder" />
          </div>

          <p className="user-name">Nombre de Usuario</p>

          <div className="racha-badge">
            <span className="flame">🔥</span>
            <span>Día 2</span>
          </div>

          <ul className="week-days">
            {DIAS.map((d, i) => (
              <li key={i}>
                <span className="day-label">{d.label}</span>
                <div className={`day-circle${d.done === 'hoy' ? ' today' : d.done ? ' done' : ''}`}>
                  {d.done ? <IconCheck /> : null}
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main top */}
        <div className="main-top">

          {/* Tarjeta mascota */}
          <div className="mascota-card">
            <div className="pet-badge">😊</div>
            <div className="pet-illustration">
              <PetDogSVG />
            </div>
            <p className="pet-name">PACO</p>
          </div>

          {/* Stats */}
          <div className="stats-col">
            <div className="stat-card">
              <span className="stat-number">6</span>
              <span className="stat-label">Pendientes</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">0</span>
              <span className="stat-label">Completadas Hoy</span>
            </div>
          </div>
        </div>

        {/* Consejo */}
        <div className="consejo-card">
          <span className="consejo-icon">📋</span>
          <div className="consejo-content">
            <h4>Consejo del día!</h4>
            <p>Completa tareas del sistema para mantener feliz a tu mascota. ¡Las tareas regulares también ayudan!</p>
          </div>
        </div>

      </div>
    </div>
>>>>>>> 28ca55dccc83d724f0e21b5c69797fd3104eaf7c
  )
}

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const DIAS = [
  { label: 'D', done: false },
  { label: 'L', done: false },
  { label: 'M', done: false },
  { label: 'M', done: true  },
  { label: 'J', done: true  },
  { label: 'V', done: 'hoy' },
  { label: 'S', done: false },
]

export default function Inicio() {
  return (
    <>
      <div className="layout">

      {/* ── Header ── */}
      <header className="app-header">
        <button className="btn-hamburger" aria-label="Menú">
          <span />
        </button>
      </header>

      {/* ── Cuerpo ── */}
      <div className="page-body">

        {/* Sidebar usuario */}
        <aside className="sidebar">
          <p className="greeting">¡Hola!</p>

          <div className="img-perfil">
            <div className="img-perfil-placeholder" />
          </div>

          <p className="user-name">Nombre de Usuario</p>

          <div className="racha-badge">
            <span className="flame">🔥</span>
            <span>Día 2</span>
          </div>

          <ul className="week-days">
            {DIAS.map((d, i) => (
              <li key={i}>
                <span className="day-label">{d.label}</span>
                <div className={`day-circle${d.done === 'hoy' ? ' today' : d.done ? ' done' : ''}`}>
                  {d.done ? <IconCheck /> : null}
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main top */}
        <div className="main-top">

          {/* Tarjeta mascota */}
          <div className="mascota-card">
            <div className="pet-badge">😊</div>
            <div className="pet-illustration">
              <PetDogSVG />
            </div>
            <p className="pet-name">PACO</p>
          </div>

          {/* Stats */}
          <div className="stats-col">
            <div className="stat-card">
              <span className="stat-number">6</span>
              <span className="stat-label">Pendientes</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">0</span>
              <span className="stat-label">Completadas Hoy</span>
            </div>
          </div>
        </div>

        {/* Consejo */}
        <div className="consejo-card">
          <span className="consejo-icon">📋</span>
          <div className="consejo-content">
            <h4>Consejo del día!</h4>
            <p>Completa tareas del sistema para mantener feliz a tu mascota. ¡Las tareas regulares también ayudan!</p>
          </div>
        </div>

      </div>
    </div>
  )


    </>
  )
}