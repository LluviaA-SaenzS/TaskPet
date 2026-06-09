// Pendientes.jsx
import { useState } from 'react'
import { useTasksContext } from '../context/TasksContext'
import TaskForm from '../componentes/TaskForm'
import '../Estilos/Pendientes.css'

const ETIQUETAS = ['Trabajo', 'Reunion', 'Tareas', 'Otros', 'Vacaciones']

function Chip({ label, activo, onClick, especial }) {
  const clases = ['pend-chip', activo ? 'activo' : '', especial ? 'especial' : '']
    .filter(Boolean).join(' ')
  return <button className={clases} onClick={onClick}>{label}</button>
}

const PRIORIDAD_CFG = {
  0: { texto: 'Urgente',     clase: 'badge-urgente' },
  1: { texto: 'Esta semana', clase: 'badge-semana'  },
  2: { texto: 'Este mes',    clase: 'badge-mes'     },
  3: { texto: null,          clase: ''              },
}

function BadgePrioridad({ prioridad }) {
  const cfg = PRIORIDAD_CFG[prioridad] ?? PRIORIDAD_CFG[3]
  if (!cfg.texto) return null
  return <span className={`badge-prioridad ${cfg.clase}`}>{cfg.texto}</span>
}

function TareaCard({ tarea, onToggle, onEditar, onEliminar, completada }) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className={`tarea-card${completada ? ' completada' : ''}`}>
      <div className="tarea-card__cabecera">
        <div className="tarea-card__titulo-wrap">
          <h3 className={`tarea-card__titulo${completada ? ' tachado' : ''}`}>
            {tarea.titulo}
          </h3>
          {!completada && <BadgePrioridad prioridad={tarea.prioridad} />}
        </div>

        <div className="tarea-card__menu-wrap">
          <button
            className="tarea-card__menu-btn"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label="Opciones"
          >⋯</button>

          {menuAbierto && (
            <div className="tarea-card__dropdown" onMouseLeave={() => setMenuAbierto(false)}>
              {!completada && (
                <button
                  className="tarea-card__dropdown-btn"
                  onClick={() => { setMenuAbierto(false); onEditar() }}
                >✏️ Editar</button>
              )}
              <button
                className="tarea-card__dropdown-btn eliminar"
                onClick={() => { setMenuAbierto(false); onEliminar() }}
              >🗑️ Eliminar</button>
            </div>
          )}
        </div>
      </div>

      {tarea.descripcion && (
        <p className="tarea-card__desc">{tarea.descripcion}</p>
      )}

      {Array.isArray(tarea.etiquetas) && tarea.etiquetas.length > 0 && (
        <div className="tarea-card__etiquetas">
          {tarea.etiquetas.map((tag) => (
            <span key={tag} className="tarea-card__tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="tarea-card__footer">
        <label className="tarea-card__done-label">
          Done
          <input
            type="checkbox"
            checked={tarea.estado === true}
            onChange={onToggle}
          />
        </label>
      </div>
    </div>
  )
}

export default function Pendientes() {
  // ── Consume el contexto compartido — misma instancia que App y que Inicio ──
  const {
    tareasCompletadas,
    cargando,
    error,
    editarTarea,
    toggleHecha,
    eliminarTarea,
    filtrarPorEtiqueta,
  } = useTasksContext()

  const [etiquetaActiva, setEtiquetaActiva] = useState(null)
  const [verCompletadas, setVerCompletadas] = useState(false)
  const [tareaEditando,  setTareaEditando]  = useState(null)

  const listaVisible = verCompletadas
    ? tareasCompletadas
    : filtrarPorEtiqueta(etiquetaActiva)

  const handleEditar = async (formData) => {
    if (!tareaEditando) return { ok: false, error: 'Sin tarea' }
    const result = await editarTarea(tareaEditando.id_tarea, formData)
    if (result.ok) setTareaEditando(null)
    return result
  }

  const handleEliminar = async (idTarea) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return
    await eliminarTarea(idTarea)
  }

  return (
    <div className="pend-page">
      <TaskForm
        open={Boolean(tareaEditando)}
        onClose={() => setTareaEditando(null)}
        onSubmit={handleEditar}
        initialData={tareaEditando}
      />

      <h1 className="pend-titulo">Mis Tareas</h1>

      <div className="pend-filtros">
        <Chip
          label="Todas"
          activo={!verCompletadas && etiquetaActiva === null}
          onClick={() => { setVerCompletadas(false); setEtiquetaActiva(null) }}
        />
        {ETIQUETAS.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            activo={!verCompletadas && etiquetaActiva === tag}
            onClick={() => {
              setVerCompletadas(false)
              setEtiquetaActiva((prev) => (prev === tag ? null : tag))
            }}
          />
        ))}
        <span className="pend-filtros-divider" />
        <Chip
          label={`Completadas${tareasCompletadas.length > 0 ? ` (${tareasCompletadas.length})` : ''}`}
          activo={verCompletadas}
          onClick={() => { setVerCompletadas((v) => !v); setEtiquetaActiva(null) }}
          especial
        />
      </div>

      {cargando && <p className="pend-estado cargando">Cargando tareas…</p>}
      {error    && <p className="pend-estado error">Error: {error}</p>}
      {!cargando && !error && listaVisible.length === 0 && (
        <p className="pend-estado vacio">
          {verCompletadas
            ? 'No hay tareas completadas.'
            : etiquetaActiva
              ? `Sin tareas con etiqueta "${etiquetaActiva}".`
              : 'No tienes tareas pendientes. ¡Agrega una con el botón +!'}
        </p>
      )}

      <div className="pend-lista">
        {listaVisible.map((tarea) => (
          <TareaCard
            key={tarea.id_tarea}
            tarea={tarea}
            completada={tarea.estado === true}
            onToggle={() => toggleHecha(tarea.id_tarea)}
            onEditar={() => setTareaEditando(tarea)}
            onEliminar={() => handleEliminar(tarea.id_tarea)}
          />
        ))}
      </div>
    </div>
  )
}
