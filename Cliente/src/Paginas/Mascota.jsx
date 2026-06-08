// Mascota.jsx
// Panel izquierdo: imagen + nivel + barra XP + 5 barras de stats
// Panel derecho:   3 tareas especiales + cronómetro compartido de 12 hrs
import { useEffect, useState } from 'react'
import { useAuth }    from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { usePet }     from '../hooks/usePet'
import { useNivel }   from '../hooks/useNivel'
import { useHabitos, STAT_INFO } from '../hooks/useHabitos'
import '../Estilos/Mascota.css'

import imgPacoDefault   from '../assets/Paco_Default.png'

// ── Colores por stat ──────────────────────────────────────────────────────────

const COLOR_STAT = {
  salud:  '#ef4444',
  animo:  '#a855f7',
  sed:    '#3b82f6',
  hambre: '#f97316',
  sueno:  '#6366f1',
}

// ── BarraStat ─────────────────────────────────────────────────────────────────

function BarraStat({ stat, valor }) {
  const info  = STAT_INFO[stat]
  const color = COLOR_STAT[stat]
  const pct   = Math.max(0, Math.min(100, valor ?? 100))

  return (
    <div className="tp-stat-row">
      <span className="tp-stat-emoji">{info.emoji}</span>
      <span className="tp-stat-label">{info.label}</span>
      <div className="tp-stat-track">
        <div
          className="tp-stat-fill"
          style={{
            width: `${pct}%`,
            background: color,
            animation: pct <= 20 ? 'tp-pulso 1s ease-in-out infinite' : 'none',
          }}
        />
      </div>
      <span className="tp-stat-pct">{pct}%</span>
    </div>
  )
}

// ── PanelMascota ──────────────────────────────────────────────────────────────

function PanelMascota({ mascota, nivel, xpActual, xpSiguiente, pctXp, totalDone }) {
  const stats = ['salud', 'animo', 'sed', 'hambre', 'sueno']
  const [imgMascota, setImgMascota] = useState(imgPacoDefault)
  
  useEffect(() => {
    if (mascota?.imagen_url) setImgMascota(mascota.imagen_url)
  }, [mascota?.imagen_url])

  if (!mascota) return null

  return (
    <div className="tp-panel-mascota">

      {/* Nivel + barra XP */}
      <div className="tp-nivel-wrap">
        <p className="tp-nivel-label">Lv.{nivel}</p>
        <div className="tp-xp-track" title={`${xpActual} / ${xpSiguiente} XP`}>
          <div className="tp-xp-fill" style={{ width: `${pctXp}%` }} />
        </div>
        <p className="tp-xp-texto">{xpActual} / {xpSiguiente} XP</p>
      </div>

      {/* Imagen */}
      <div className="tp-mascota-img-wrap">
        {mascota.imagen_url
        ? <img src={mascota.imagen_url} alt={mascota.nombre} className="tp-mascota-img" />
          : <div className="tp-mascota-placeholder"><img
                          src={imgMascota}
                          alt="mascota"
                          onError={(e) => {
                            e.target.onerror = null
                            setImgMascota(imgPacoDefault)
                        }}
                        /></div>
        }
      </div>

      {/* Nombre */}
      <p className="tp-mascota-nombre">{mascota.nombre?.toUpperCase()}</p>

      {/* Stats */}
      <div className="tp-stats-lista">
        {stats.map((s) => (
          <BarraStat key={s} stat={s} valor={mascota[s]} />
        ))}
      </div>

      {/* Progreso del día */}
      <div className="tp-dia-progreso">
        <span>{totalDone} / 3 hoy</span>
        <div className="tp-dia-track">
          <div className="tp-dia-fill" style={{ width: `${(totalDone / 3) * 100}%` }} />
        </div>
      </div>

    </div>
  )
}

// ── TareaEspecial ─────────────────────────────────────────────────────────────

function TareaEspecial({ habito, hecho, onToggle }) {
  const info = STAT_INFO[habito.stat] ?? { emoji: '⭐', label: habito.stat, color: '#888' }

  return (
    <div className={`tp-tarea-card ${hecho ? 'tp-tarea-hecha' : ''}`}>

      <div className="tp-tarea-head">
        <h3 className="tp-tarea-titulo">{habito.nombre}</h3>
        <span
          className="tp-tarea-stat-badge"
          style={{ background: `${info.color}22`, color: info.color }}
        >
          {info.emoji} {info.label}
        </span>
      </div>

      <p className="tp-tarea-puntos">+{habito.unidad} pts · {info.label}</p>

      <div className="tp-tarea-footer">
        <span
          className="tp-tarea-circulo"
          style={{ background: hecho ? info.color : 'var(--tp-border, #e5e7eb)' }}
        />
        <label className="tp-tarea-done-label">
          Done
          <input
            type="checkbox"
            checked={hecho}
            onChange={onToggle}
            className="tp-tarea-checkbox"
          />
        </label>
      </div>

    </div>
  )
}

// ── PanelTareas ───────────────────────────────────────────────────────────────

function PanelTareas({ habitosDia, done, tiempoFormateado, totalDone, onToggle, cargando, error }) {
  return (
    <div className="tp-panel-tareas">
      <h2 className="tp-tareas-titulo">Tareas Especiales</h2>

      <div className="tp-timer-row">
        <span className="tp-timer-progreso">{totalDone}/3</span>
        <span className="tp-timer-clock">⏱ {tiempoFormateado}</span>
      </div>

      {cargando && <p className="tp-tareas-estado">Cargando hábitos…</p>}
      {error    && <p className="tp-tareas-estado tp-tareas-error">{error}</p>}

      {!cargando && !error && (
        <div className="tp-tareas-lista">
          {habitosDia.map((h) => (
            <TareaEspecial
              key={h.id_habito}
              habito={h}
              hecho={done[h.id_habito] ?? false}
              onToggle={() => onToggle(h.id_habito)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function Mascota() {
  const { usuarioActivo }                    = useAuth()
  const { perfil, cargando: cargandoPerfil } = useProfile(usuarioActivo)
   

  const {
    mascota,
    cargando: cargandoMascota,
    subirStatPorHabito,
  } = usePet(perfil?.id_usuario)

  const {
    nivel,
    xpActual,
    xpSiguiente,
    pctXp,
    recargar: recargarNivel,
  } = useNivel(perfil?.id_usuario)

  const {
    habitosDia,
    done,
    totalDone,
    tiempoFormateado,
    cargando: cargandoHabitos,
    error:    errorHabitos,
    marcarHecho,
  } = useHabitos(perfil?.id_usuario)

  // Al marcar: sube stat de la mascota y recalcula nivel
  const handleToggle = async (idHabito) => {
    const result = await marcarHecho(idHabito)
    if (result.ok && result.stat) {
      await subirStatPorHabito(result.stat, result.puntos)
      await recargarNivel()   // refleja los nuevos puntos en la barra XP
    }
  }

  // ── Guardas ─────────────────────────────────────────────────────────────────

  if (cargandoPerfil || cargandoMascota) {
    return (
      <div className="tp-mascota-loading">
        <span className="tp-loading-emoji">🐾</span>
        <p>Cargando mascota…</p>
      </div>
    )
  }

  if (!mascota) {
    return (
      <div className="tp-mascota-loading">
        <span className="tp-loading-emoji">🥚</span>
        <p>Aún no tienes mascota. ¡Crea una en Configuración!</p>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="tp-mascota-page">
      <PanelMascota
        mascota={mascota}
        nivel={nivel}
        xpActual={xpActual}
        xpSiguiente={xpSiguiente}
        pctXp={pctXp}
        totalDone={totalDone}
      />
      <PanelTareas
        habitosDia={habitosDia}
        done={done}
        tiempoFormateado={tiempoFormateado}
        totalDone={totalDone}
        onToggle={handleToggle}
        cargando={cargandoHabitos}
        error={errorHabitos}
      />
    </div>
  )
}
