import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { usePet } from '../hooks/usePet'
import { useStreak } from '../hooks/useStreak'
import TaskForm       from '../componentes/TaskForm'

import '../Estilos/Inicio.css'


const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const DIAS_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
const diaHoy = new Date().getDay()


export default function Inicio() {
  const { usuarioActivo } = useAuth()
  const { perfil, cargando } = useProfile(usuarioActivo)
  const { mascota } = usePet(perfil?.id_usuario)
  const { racha, semanaVisual, actividadHoy } = useStreak(perfil?.id_usuario)
  const DIAS = DIAS_LABELS.map((label, i) => ({
  label,
  done: i === diaHoy && actividadHoy ? 'hoy' : semanaVisual[i],
}))
  return (
    <>
      <div className="layout">

      {/* ── Header ── */}
      <header className="app-header">
      </header>

      {/* ── Cuerpo ── */}
      <div className="page-body">

        {/* Sidebar usuario */}
        <aside className="sidebar">
          <p className="greeting">¡Hola!</p>

          <div className="img-perfil">
              <img src={perfil?.avatar_url } alt="avatar" />
          </div>

          <p className="user-name">Bienvenido {cargando ? '...' : perfil?.usuario || 'Nombre de Usuario'}</p>

          <div className="racha-badge">
            <span className="flame">🔥</span>
            <span>{racha?.acumulado ?? 0} días</span>
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
              <img src={mascota?.imagen_url ?? '/Paco_Default.png'} alt="mascota" />
            </div>
            <p className="pet-name">{mascota?.nombre}</p>
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



    </>
  )
}