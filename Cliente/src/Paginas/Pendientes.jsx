// Pendientes.jsx
// - Vista normal: tareas pendientes (estado=false), ordenadas por prioridad
// - Filtro "Completadas": muestra estado=true
// - Filtros de etiqueta: aplican solo sobre pendientes
// - Props: showForm / onCloseForm  (del Navbar "+" en App.jsx)

import { useState } from 'react'
import { useAuth }    from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useTasks }   from '../hooks/useTasks'
import TaskForm       from '../componentes/TaskForm'

const ETIQUETAS = ['Trabajo', 'Reunion', 'Tareas', 'Otros', 'Vacaciones']

// Chip de etiqueta reutilizable
function Chip({ label, activo, onClick, especial }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: '1px solid var(--tp-border)',
        borderRadius: 999,
        padding: '5px 14px',
        fontSize: 13,
        cursor: 'pointer',
        background: activo
          ? especial ? '#7c3aed' : 'var(--tp-primary)'
          : 'var(--tp-surface2)',
        color: activo ? '#fff' : 'var(--tp-fg)',
        borderColor: activo
          ? especial ? '#7c3aed' : 'var(--tp-primary)'
          : 'var(--tp-border)',
        fontWeight: especial ? 600 : 400,
      }}
    >
      {label}
    </button>
  )
}

// Badge de prioridad
const PRIORIDAD_LABEL = {
  0: { texto: 'Urgente',    color: '#ef4444', bg: '#fee2e2' },
  1: { texto: 'Esta semana', color: '#f59e0b', bg: '#fef3c7' },
  2: { texto: 'Este mes',    color: '#3b82f6', bg: '#dbeafe' },
  3: { texto: '',            color: '',        bg: ''        },
}

function BadgePrioridad({ prioridad }) {
  const info = PRIORIDAD_LABEL[prioridad] ?? PRIORIDAD_LABEL[3]
  if (!info.texto) return null
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 999,
      background: info.bg,
      color: info.color,
      marginLeft: 8,
    }}>
      {info.texto}
    </span>
  )
}

// Card de tarea
function TareaCard({ tarea, onToggle, onEditar, onEliminar, completada }) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div style={{
      background: 'var(--tp-surface)',
      border: '1px solid var(--tp-border)',
      borderRadius: 12,
      padding: '14px 16px',
      opacity: completada ? 0.6 : 1,
      transition: 'opacity 0.2s',
    }}>
      {/* Cabecera */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 8 }}>
        <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:4 }}>
          <h3 style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--tp-fg)',
            textDecoration: completada ? 'line-through' : 'none',
          }}>
            {tarea.titulo}
          </h3>
          {!completada && <BadgePrioridad prioridad={tarea.prioridad} />}
        </div>

        {/* Menú ⋯ */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, padding:'0 4px', color:'var(--tp-muted)', lineHeight:1 }}
          >
            ⋯
          </button>
          {menuAbierto && (
            <div
              onMouseLeave={() => setMenuAbierto(false)}
              style={{
                position:'absolute', right:0, top:'100%',
                background:'var(--tp-surface)', border:'1px solid var(--tp-border)',
                borderRadius:8, boxShadow:'0 4px 12px rgba(0,0,0,0.12)',
                zIndex:100, minWidth:130, overflow:'hidden',
              }}
            >
              {!completada && (
                <button
                  style={{ display:'block', width:'100%', padding:'10px 14px', background:'none', border:'none', textAlign:'left', fontSize:14, cursor:'pointer', color:'var(--tp-fg)' }}
                  onClick={() => { setMenuAbierto(false); onEditar() }}
                >
                  ✏️ Editar
                </button>
              )}
              <button
                style={{ display:'block', width:'100%', padding:'10px 14px', background:'none', border:'none', textAlign:'left', fontSize:14, cursor:'pointer', color:'#ef4444' }}
                onClick={() => { setMenuAbierto(false); onEliminar() }}
              >
                🗑️ Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Descripción */}
      {tarea.descripcion && (
        <p style={{ margin:'0 0 10px', fontSize:14, color:'var(--tp-muted)', lineHeight:1.5 }}>
          {tarea.descripcion}
        </p>
      )}

      {/* Etiquetas */}
      {Array.isArray(tarea.etiquetas) && tarea.etiquetas.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
          {tarea.etiquetas.map((tag) => (
            <span key={tag} style={{ background:'#ede9fe', color:'#6d28d9', borderRadius:999, padding:'2px 10px', fontSize:12, fontWeight:500 }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Done */}
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <label style={{ display:'flex', alignItems:'center', fontSize:14, color:'var(--tp-fg)', cursor:'pointer', userSelect:'none' }}>
          Done
          <input
            type="checkbox"
            checked={tarea.estado === true}
            onChange={onToggle}
            style={{ marginLeft:6, cursor:'pointer' }}
          />
        </label>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function Pendientes({ showForm, onCloseForm }) {
  const { usuarioActivo }              = useAuth()
  const { perfil, cargando: cargandoPerfil } = useProfile(usuarioActivo)

  const {
    tareasPendientes,
    tareasCompletadas,
    cargando,
    error,
    crearTarea,
    editarTarea,
    toggleHecha,
    eliminarTarea,
    filtrarPorEtiqueta,
  } = useTasks(perfil?.id_usuario)

  const [etiquetaActiva, setEtiquetaActiva] = useState(null)
  const [verCompletadas, setVerCompletadas] = useState(false)
  const [tareaEditando,  setTareaEditando]  = useState(null)

  // Lista a mostrar según el modo activo
  const listaVisible = verCompletadas
    ? tareasCompletadas
    : filtrarPorEtiqueta(etiquetaActiva)

  const handleCrear = async (formData) => crearTarea(formData)

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

  const handleClickEtiqueta = (tag) => {
    setVerCompletadas(false)
    setEtiquetaActiva((prev) => (prev === tag ? null : tag))
  }

  const handleClickCompletadas = () => {
    setVerCompletadas((v) => !v)
    setEtiquetaActiva(null)
  }

  if (cargandoPerfil) return <p style={{ color:'var(--tp-muted)', textAlign:'center', marginTop:40 }}>Cargando perfil…</p>

  return (
    <div style={{ padding:'24px 16px', maxWidth:700, margin:'0 auto' }}>

      {/* Formulario nueva tarea */}
      <TaskForm open={showForm}             onClose={onCloseForm}             onSubmit={handleCrear} />
      {/* Formulario editar */}
      <TaskForm open={Boolean(tareaEditando)} onClose={() => setTareaEditando(null)} onSubmit={handleEditar} initialData={tareaEditando} />

      <h1 style={{ fontSize:24, fontWeight:700, margin:'0 0 18px', color:'var(--tp-fg)' }}>
        Mis Tareas
      </h1>

      {/* ── Filtros ── */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
        {/* Etiquetas normales — solo activas cuando no estamos en "Completadas" */}
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
            onClick={() => handleClickEtiqueta(tag)}
          />
        ))}

        {/* Separador visual */}
        <span style={{ width:1, background:'var(--tp-border)', margin:'0 4px', alignSelf:'stretch' }} />

        {/* Tag especial Completadas */}
        <Chip
          label={`✅ Completadas${tareasCompletadas.length > 0 ? ` (${tareasCompletadas.length})` : ''}`}
          activo={verCompletadas}
          onClick={handleClickCompletadas}
          especial
        />
      </div>

      {/* Estados */}
      {cargando && <p style={{ color:'var(--tp-muted)', textAlign:'center', marginTop:40 }}>Cargando tareas…</p>}
      {error    && <p style={{ color:'#ef4444', textAlign:'center', marginTop:20 }}>Error: {error}</p>}

      {!cargando && !error && listaVisible.length === 0 && (
        <p style={{ color:'var(--tp-muted)', textAlign:'center', marginTop:40, fontSize:14 }}>
          {verCompletadas
            ? 'No hay tareas completadas.'
            : etiquetaActiva
              ? `Sin tareas con etiqueta "${etiquetaActiva}".`
              : 'No tienes tareas pendientes. ¡Agrega una con el botón +!'}
        </p>
      )}

      {/* Lista */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
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
