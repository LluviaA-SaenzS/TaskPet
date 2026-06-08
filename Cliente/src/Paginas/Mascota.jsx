// Mascota.jsx
// Panel izquierdo: imagen + nivel + barra XP + 5 barras de stats
// Panel derecho:   3 tareas especiales + cronómetro a medianoche
import { useEffect, useState } from 'react'
import {
  Heart, Smile, Droplets, Bone, Moon,
  Clock, CheckCircle2, Circle,
} from 'lucide-react'

import { useAuth }    from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { usePet }     from '../hooks/usePet'
import { useNivel }   from '../hooks/useNivel'
import { useHabitos, STAT_INFO } from '../hooks/useHabitos'
import '../Estilos/Mascota.css'

import imgPacoDefault from '../assets/Paco_Default.png'

// ── Íconos por stat ───────────────────────────────────────────────────────────

const ICONO_STAT = {
  salud:   <Heart  size={14} strokeWidth={2} />,
  animo:   <Smile  size={14} strokeWidth={2} />,
  sed:     <Droplets size={14} strokeWidth={2} />,
  hambre:  <Bone   size={14} strokeWidth={2} />,
  sueno:   <Moon   size={14} strokeWidth={2} />,
}

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
      <span className="tp-stat-emoji" style={{ color }}>
        {ICONO_STAT[stat]}
      </span>
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
  const [imgSrc, setImgSrc] = useState(mascota?.imagen_url || imgPacoDefault)

  useEffect(() => {
    setImgSrc(mascota?.imagen_url || imgPacoDefault)
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
        <img
          src={imgSrc}
          alt={mascota.nombre}
          className="tp-mascota-img"
          onError={() => setImgSrc(imgPacoDefault)}
        />
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
  const info  = STAT_INFO[habito.stat] ?? { emoji: '⭐', label: habito.stat, color: '#888' }
  const icono = ICONO_STAT[habito.stat]

  return (
    <div className={`tp-tarea-card ${hecho ? 'tp-tarea-hecha' : ''}`}>

      <div className="tp-tarea-head">
        <h3 className="tp-tarea-titulo">{habito.nombre}</h3>
        <span
          className="tp-tarea-stat-badge"
          style={{ background: `${info.color}22`, color: info.color }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {icono} {info.label}
          </span>
        </span>
      </div>

      <p className="tp-tarea-puntos">+{habito.unidad} pts · {info.label}</p>

      <div className="tp-tarea-footer">
        <button
          className="tp-tarea-done-btn"
          onClick={onToggle}
          aria-label={hecho ? 'Desmarcar tarea' : 'Marcar como hecha'}
        >
          {hecho
            ? <CheckCircle2 size={22} color={info.color} strokeWidth={2} />
            : <Circle       size={22} color="var(--tp-border)" strokeWidth={2} />
          }
          <span style={{ color: hecho ? info.color : 'var(--tp-muted)' }}>
            {hecho ? 'Hecho' : 'Marcar'}
          </span>
        </button>
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
        <span className="tp-timer-clock">
          <Clock size={14} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {tiempoFormateado}
        </span>
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

  const handleToggle = async (idHabito) => {
    const result = await marcarHecho(idHabito)
    if (result.ok && result.stat) {
      await subirStatPorHabito(result.stat, result.puntos)
      await recargarNivel()
    }
  }

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
