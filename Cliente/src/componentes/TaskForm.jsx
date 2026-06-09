// TaskForm.jsx
// Props:
//   open        : boolean
//   onClose     : () => void
//   onSubmit    : (formData) => Promise<{ ok, error? }>
//   initialData : tarea existente (modo edición) o null (modo creación)

import { useState, useEffect } from 'react'

const ETIQUETAS = ['Trabajo', 'Reunion', 'Tareas', 'Otros', 'Vacaciones']

const FORM_VACIO = {
  titulo:       '',
  descripcion:  '',
  fecha_inicio: '',
  hora_inicio:  '',
  fecha_limite: '',
  hora_fin:     '',
  etiquetas:    [],
}

export default function TaskForm({ open, onClose, onSubmit, initialData = null }) {
  const editando = Boolean(initialData)
  const [form, setForm]         = useState(FORM_VACIO)
  const [enviando, setEnviando] = useState(false)
  const [errForm, setErrForm]   = useState(null)

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? {
              titulo:       initialData.titulo       ?? '',
              descripcion:  initialData.descripcion  ?? '',
              fecha_inicio: initialData.fecha_inicio ?? '',
              hora_inicio:  initialData.hora_inicio  ?? '',
              fecha_limite: initialData.fecha_limite ?? '',
              hora_fin:     initialData.hora_fin     ?? '',
              etiquetas:    initialData.etiquetas    ?? [],
            }
          : FORM_VACIO
      )
      setErrForm(null)
    }
  }, [open, initialData])

  if (!open) return null

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const toggleEtiqueta = (tag) =>
    setForm((prev) => ({
      ...prev,
      etiquetas: prev.etiquetas.includes(tag)
        ? prev.etiquetas.filter((e) => e !== tag)
        : [...prev.etiquetas, tag],
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) { setErrForm('El título es obligatorio.'); return }
    setEnviando(true)
    setErrForm(null)
    const resultado = await onSubmit(form)
    setEnviando(false)
    if (resultado?.ok === false) {
      setErrForm(resultado.error ?? 'Error desconocido.')
    } else {
      onClose()
    }
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <h2 style={s.titulo}>{editando ? 'Editar tarea' : 'Nueva tarea'}</h2>

        <form onSubmit={handleSubmit} style={s.form}>

          <label style={s.label}>
            Título *
            <input
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              placeholder="¿Qué hay que hacer?"
              style={s.input}
              autoFocus
            />
          </label>

          <label style={s.label}>
            Descripción
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Detalles opcionales…"
              rows={3}
              style={{ ...s.input, resize: 'vertical' }}
            />
          </label>

          {/* Fecha y hora inicio */}
          <div style={s.fila}>
            <label style={{ ...s.label, flex: 2 }}>
              Fecha inicio
              <input
                type="date"
                name="fecha_inicio"
                value={form.fecha_inicio}
                onChange={handleChange}
                style={s.input}
              />
            </label>
            <label style={{ ...s.label, flex: 1 }}>
              Hora inicio
              <input
                type="time"
                name="hora_inicio"
                value={form.hora_inicio}
                onChange={handleChange}
                style={s.input}
              />
            </label>
          </div>

          {/* Fecha y hora límite */}
          <div style={s.fila}>
            <label style={{ ...s.label, flex: 2 }}>
              Fecha límite
              <input
                type="date"
                name="fecha_limite"
                value={form.fecha_limite}
                onChange={handleChange}
                style={s.input}
              />
            </label>
            <label style={{ ...s.label, flex: 1 }}>
              Hora fin
              <input
                type="time"
                name="hora_fin"
                value={form.hora_fin}
                onChange={handleChange}
                style={s.input}
              />
            </label>
          </div>

          <div style={s.label}>
            Etiquetas
            <div style={s.tags}>
              {ETIQUETAS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleEtiqueta(tag)}
                  style={{
                    ...s.tag,
                    ...(form.etiquetas.includes(tag) ? s.tagActivo : {}),
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {errForm && <p style={s.error}>{errForm}</p>}

          <div style={s.acciones}>
            <button type="button" onClick={onClose} style={s.btnSec} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" style={s.btnPri} disabled={enviando}>
              {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

const s = {
  overlay:  { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 },
  modal:    { background:'var(--tp-surface)', borderRadius:14, padding:'24px 28px', width:'100%', maxWidth:460, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' },
  titulo:   { margin:'0 0 18px', fontSize:18, fontWeight:700, color:'var(--tp-fg)' },
  form:     { display:'flex', flexDirection:'column', gap:14 },
  label:    { display:'flex', flexDirection:'column', gap:4, fontSize:13, fontWeight:500, color:'var(--tp-fg)' },
  input:    { border:'1px solid var(--tp-border)', borderRadius:8, padding:'8px 10px', fontSize:14, background:'var(--tp-surface2)', color:'var(--tp-fg)', outline:'none' },
  fila:     { display:'flex', gap:12 },
  tags:     { display:'flex', flexWrap:'wrap', gap:8, marginTop:4 },
  tag:      { border:'1px solid var(--tp-border)', borderRadius:999, padding:'4px 12px', fontSize:13, cursor:'pointer', background:'var(--tp-surface2)', color:'var(--tp-fg)' },
  tagActivo:{ background:'var(--tp-primary)', color:'#fff' },
  acciones: { display:'flex', justifyContent:'flex-end', gap:10, marginTop:6 },
  btnPri:   { background:'var(--tp-primary)', color:'#fff', border:'none', borderRadius:8, padding:'9px 20px', fontSize:14, fontWeight:600, cursor:'pointer' },
  btnSec:   { background:'var(--tp-surface2)', color:'var(--tp-fg)', border:'1px solid var(--tp-border)', borderRadius:8, padding:'9px 20px', fontSize:14, cursor:'pointer' },
  error:    { color:'#ef4444', fontSize:13, margin:0 },
}
