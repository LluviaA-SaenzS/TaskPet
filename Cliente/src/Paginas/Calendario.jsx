// Calendario.jsx
// Muestra un calendario mensual con eventos/tareas.
// Estrategia de datos: localStorage primero, Supabase como fuente de verdad.
// Cache key: `tp_cal_YYYY_MM_idUsuario`

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth }    from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import '../Estilos/Calendario.css'

// ── Paleta de colores por evento (estilo Google Calendar) ─────────────────────
const COLORES_EVENTO = [
  '#4285F4', // azul Google
  '#0F9D58', // verde
  '#F4B400', // amarillo
  '#DB4437', // rojo
  '#AB47BC', // morado
  '#00ACC1', // cian
  '#FF7043', // naranja
  '#8D6E63', // marrón
]

// Asigna un color consistente por id_evento o id_tarea
function colorEvento(id) {
  return COLORES_EVENTO[Math.abs(id ?? 0) % COLORES_EVENTO.length]
}

// ── Helpers de fecha ──────────────────────────────────────────────────────────
function diasDelMes(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function primerDiaSemana(year, month) {
  return new Date(year, month, 1).getDay() // 0=Dom
}

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

const DIAS = ['D','L','M','M','J','V','S']

// ── Cache localStorage ────────────────────────────────────────────────────────
function cacheKey(idUsuario, year, month) {
  return `tp_cal_${year}_${month}_${idUsuario}`
}

function leerCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { datos, ts } = JSON.parse(raw)
    // TTL: 5 minutos
    if (Date.now() - ts > 5 * 60 * 1000) return null
    return datos
  } catch {
    return null
  }
}

function escribirCache(key, datos) {
  try {
    localStorage.setItem(key, JSON.stringify({ datos, ts: Date.now() }))
  } catch {
    // localStorage lleno — ignorar
  }
}

function invalidarCacheMes(idUsuario, year, month) {
  try {
    localStorage.removeItem(cacheKey(idUsuario, year, month))
  } catch {
    
  }
}

// ── Fetch de eventos + tareas del mes ────────────────────────────────────────
async function fetchMes(idUsuario, year, month) {
  const inicio = new Date(year, month, 1).toISOString()
  const fin    = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

  const [{ data: eventos }, { data: tareas }] = await Promise.all([
    supabase
      .from('eventos')
      .select('id_evento, titulo, descripcion, fecha_inicio, fecha_final')
      .eq('id_usuario', idUsuario)
      .gte('fecha_inicio', inicio)
      .lte('fecha_inicio', fin),
    supabase
      .from('tareas')
      .select('id_tarea, titulo, fecha_limite, estado, etiquetas, prioridad')
      .eq('id_usuario', idUsuario)
      .eq('archivada', false)
      .gte('fecha_limite', inicio)
      .lte('fecha_limite', fin),
  ])

  // Normalizar a { id, tipo, titulo, dia, color }
  const evNorm = (eventos ?? []).map((e) => ({
    id:     `ev-${e.id_evento}`,
    tipo:   'evento',
    titulo: e.titulo,
    dia:    new Date(e.fecha_inicio).getDate(),
    color:  colorEvento(e.id_evento),
    datos:  e,
  }))

  const taNorm = (tareas ?? []).map((t) => ({
    id:     `ta-${t.id_tarea}`,
    tipo:   t.estado ? 'completada' : 'pendiente',
    titulo: t.titulo,
    dia:    new Date(t.fecha_limite).getDate(),
    color:  t.estado ? '#9E9E9E' : colorEvento(t.id_tarea + 100),
    datos:  t,
  }))

  return [...evNorm, ...taNorm]
}

// ── Componente chip de evento en celda ────────────────────────────────────────
function EventoChip({ ev, onClick }) {
  return (
    <button
      className={`cal-chip cal-chip--${ev.tipo}`}
      style={{ '--chip-color': ev.color }}
      onClick={(e) => { e.stopPropagation(); onClick(ev) }}
      title={ev.titulo}
    >
      <span className="cal-chip__dot" />
      <span className="cal-chip__titulo">{ev.titulo}</span>
    </button>
  )
}

// ── Detalle flotante de evento ────────────────────────────────────────────────
function EventoDetalle({ ev, onClose }) {
  if (!ev) return null
  const d = ev.datos

  return (
    <div className="cal-detalle-overlay" onClick={onClose}>
      <div className="cal-detalle" onClick={(e) => e.stopPropagation()}>
        <button className="cal-detalle__cerrar" onClick={onClose}>✕</button>
        <div className="cal-detalle__color" style={{ background: ev.color }} />
        <h3 className="cal-detalle__titulo">{ev.titulo}</h3>
        <span className={`cal-detalle__badge cal-detalle__badge--${ev.tipo}`}>
          {ev.tipo === 'evento' ? 'Evento' : ev.tipo === 'completada' ? 'Completada' : 'Pendiente'}
        </span>
        {d.descripcion && (
          <p className="cal-detalle__desc">{d.descripcion}</p>
        )}
        {d.fecha_inicio && (
          <p className="cal-detalle__meta">
            📅 {new Date(d.fecha_inicio).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
            {d.fecha_final && ` → ${new Date(d.fecha_final).toLocaleDateString('es-MX', { dateStyle: 'medium' })}`}
          </p>
        )}
        {d.fecha_limite && (
          <p className="cal-detalle__meta">
            ⏰ Límite: {new Date(d.fecha_limite).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
          </p>
        )}
        {d.etiquetas?.length > 0 && (
          <div className="cal-detalle__tags">
            {d.etiquetas.map((tag) => (
              <span key={tag} className="cal-detalle__tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Leyenda ───────────────────────────────────────────────────────────────────
function Leyenda() {
  return (
    <div className="cal-leyenda">
      <span className="cal-leyenda__item">
        <span className="cal-leyenda__circulo cal-leyenda__circulo--hoy" />
        Día actual
      </span>
      <span className="cal-leyenda__item">
        <span className="cal-leyenda__circulo cal-leyenda__circulo--pendiente" />
        Tarea pendiente
      </span>
      <span className="cal-leyenda__item">
        <span className="cal-leyenda__circulo cal-leyenda__circulo--completada" />
        Tarea completada
      </span>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Calendario() {
  const { usuarioActivo }  = useAuth()
  const { perfil }         = useProfile(usuarioActivo)

  const hoy = new Date()
  const [mes, setMes]     = useState(hoy.getMonth())
  const [anio, setAnio]   = useState(hoy.getFullYear())
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(false)
  const [evSel, setEvSel] = useState(null)

  // ── Carga con cache ──────────────────────────────────────────────────────
  const cargarMes = useCallback(async (year, month, uid) => {
    if (!uid) return
    const key = cacheKey(uid, year, month)

    // 1. Intentar cache
    const cached = leerCache(key)
    if (cached) {
      setItems(cached)
      return
    }

    // 2. Ir a Supabase
    setCargando(true)
    try {
      const datos = await fetchMes(uid, year, month)
      setItems(datos)
      escribirCache(key, datos)
    } catch (err) {
      console.error('Error cargando mes:', err)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (perfil?.id_usuario) {
      cargarMes(anio, mes, perfil.id_usuario)
    }
  }, [anio, mes, perfil?.id_usuario, cargarMes])

  // Recargar sin cache (útil si se crea una tarea nueva)
  const recargar = useCallback(() => {
    if (!perfil?.id_usuario) return
    invalidarCacheMes(perfil.id_usuario, anio, mes)
    cargarMes(anio, mes, perfil.id_usuario)
  }, [anio, mes, perfil?.id_usuario, cargarMes])

  // ── Navegación ────────────────────────────────────────────────────────────
  const irMesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio((a) => a - 1) }
    else setMes((m) => m - 1)
  }
  const irMesSiguiente = () => {
    if (mes === 11) { setMes(0); setAnio((a) => a + 1) }
    else setMes((m) => m + 1)
  }

  // ── Construir cuadrícula del mes ──────────────────────────────────────────
  const celdas = useMemo(() => {
    const total = diasDelMes(anio, mes)
    const offset = primerDiaSemana(anio, mes)
    const arr = []
    for (let i = 0; i < offset; i++) arr.push(null)
    for (let d = 1; d <= total; d++) arr.push(d)
    // Rellenar filas completas
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [anio, mes])

  // Agrupar items por día
  const porDia = useMemo(() => {
    const map = {}
    items.forEach((ev) => {
      if (!map[ev.dia]) map[ev.dia] = []
      map[ev.dia].push(ev)
    })
    return map
  }, [items])

  const esHoy = (dia) =>
    dia !== null &&
    dia === hoy.getDate() &&
    mes === hoy.getMonth() &&
    anio === hoy.getFullYear()

  return (
    <div className="cal-page">

      {/* Cabecera */}
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={irMesAnterior} aria-label="Mes anterior">‹</button>
        <h2 className="cal-mes-titulo">
          {MESES[mes]} {anio}
          {cargando && <span className="cal-spinner" />}
        </h2>
        <button className="cal-nav-btn" onClick={irMesSiguiente} aria-label="Mes siguiente">›</button>
        <button className="cal-refresh-btn" onClick={recargar} title="Actualizar" aria-label="Actualizar">↻</button>
      </div>

      {/* Días de la semana */}
      <div className="cal-grid cal-grid--header">
        {DIAS.map((d, i) => (
          <div key={i} className="cal-dia-nombre">{d}</div>
        ))}
      </div>

      {/* Cuadrícula */}
      <div className="cal-grid cal-grid--body">
        {celdas.map((dia, idx) => {
          const hoyFlag  = esHoy(dia)
          const eventos  = dia ? (porDia[dia] ?? []) : []
          const MAX_VIS  = 3

          return (
            <div
              key={idx}
              className={[
                'cal-celda',
                dia === null ? 'cal-celda--vacia' : '',
                hoyFlag     ? 'cal-celda--hoy'   : '',
              ].filter(Boolean).join(' ')}
            >
              {dia !== null && (
                <>
                  <span className={`cal-num${hoyFlag ? ' cal-num--hoy' : ''}`}>
                    {dia}
                  </span>

                  <div className="cal-chips">
                    {eventos.slice(0, MAX_VIS).map((ev) => (
                      <EventoChip key={ev.id} ev={ev} onClick={setEvSel} />
                    ))}
                    {eventos.length > MAX_VIS && (
                      <button
                        className="cal-mas"
                        onClick={() => setEvSel(eventos[MAX_VIS])}
                      >
                        +{eventos.length - MAX_VIS} más
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      <Leyenda />

      {/* Detalle flotante */}
      <EventoDetalle ev={evSel} onClose={() => setEvSel(null)} />
    </div>
  )
}
