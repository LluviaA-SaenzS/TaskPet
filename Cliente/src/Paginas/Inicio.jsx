// Inicio.jsx
import imgPacoDefault   from '../assets/Paco_Default.png'
import imgAvatarDefault from '../assets/avatar_default.png'

import { useEffect, useState } from 'react'
import { useAuth }           from '../hooks/useAuth'
import { useProfile }        from '../hooks/useProfile'
import { usePet }            from '../hooks/usePet'
import { useStreak }         from '../hooks/useStreak'
import { useTasksContext }   from '../context/TasksContext'

import '../Estilos/Inicio.css'

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const DIAS_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
const diaHoy = new Date().getDay()

// Devuelve true si completada_en es de hoy (hora local)
function esHoy(fechaISO) {
  if (!fechaISO) return false
  const d = new Date(fechaISO)
  const hoy = new Date()
  return (
    d.getFullYear() === hoy.getFullYear() &&
    d.getMonth()    === hoy.getMonth()    &&
    d.getDate()     === hoy.getDate()
  )
}

export default function Inicio() {
  const { usuarioActivo }              = useAuth()
  const { perfil, cargando }           = useProfile(usuarioActivo)
  const { mascota }                    = usePet(perfil?.id_usuario)
  const { racha, semanaVisual, actividadHoy } = useStreak(perfil?.id_usuario)

  // ── Contadores: misma instancia que Pendientes via contexto ──────────────
  const { tareasPendientes, tareasCompletadas } = useTasksContext()

  // Completadas HOY (no todas las completadas históricas)
  const completadasHoy = tareasCompletadas.filter((t) => esHoy(t.completada_en)).length

  const [imgMascota, setImgMascota] = useState(imgPacoDefault)
  const [imgAvatar,  setImgAvatar]  = useState(imgAvatarDefault)

  useEffect(() => {
    if (mascota?.imagen_url) setImgMascota(mascota.imagen_url)
  }, [mascota?.imagen_url])

  useEffect(() => {
    if (perfil?.avatar_url) setImgAvatar(perfil.avatar_url)
  }, [perfil?.avatar_url])

  const DIAS = DIAS_LABELS.map((label, i) => ({
    label,
    done: i === diaHoy && actividadHoy ? 'hoy' : semanaVisual[i],
  }))

  return (
    <div className="layout">

      <header className="app-header" />

      <div className="page-body">

        {/* Sidebar usuario */}
        <aside className="sidebar">
          <p className="greeting">¡Hola!</p>

          <div className="img-perfil">
            <img
              src={imgAvatar}
              alt="avatar"
              onError={(e) => { e.target.onerror = null; setImgAvatar(imgAvatarDefault) }}
            />
          </div>

          <p className="user-name">
            Bienvenido {cargando ? '…' : perfil?.usuario || 'Usuario'}
          </p>

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
            <div className="pet-illustration">
              <img
                src={imgMascota}
                alt="mascota"
                onError={(e) => { e.target.onerror = null; setImgMascota(imgPacoDefault) }}
              />
            </div>
            <p className="pet-name">{mascota?.nombre}</p>
          </div>

          {/* Contadores reales */}
          <div className="stats-col">
            <div className="stat-card">
              <span className="stat-number">{tareasPendientes.length}</span>
              <span className="stat-label">Pendientes</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{completadasHoy}</span>
              <span className="stat-label">Completadas hoy</span>
            </div>
          </div>
        </div>

        {/* Consejo */}
        <div className="consejo-card">
          <span className="consejo-icon">📋</span>
          <div className="consejo-content">
            <h4>Consejo del día</h4>
            <p>Completa tareas del sistema para mantener feliz a tu mascota. ¡Las tareas regulares también ayudan!</p>
          </div>
        </div>

      </div>
    </div>
  )
}
