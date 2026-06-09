// App.jsx
import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import PWABadge from './PWABadge.jsx'
import './App.css'

import NavBar         from './componentes/NavBar'
import TaskForm       from './componentes/TaskForm'
import RutaProtegida  from './componentes/RutaProtegida'

import { TasksProvider, useTasksContext } from './context/TasksContext'

import Landing       from './Paginas/Landing.jsx'
import Auth          from './Paginas/Auth.jsx'
import Inicio        from './Paginas/Inicio'
import Pendientes    from './Paginas/Pendientes'
import Calendario    from './Paginas/Calendario'
import Mascota       from './Paginas/Mascota'
import Configuracion from './Paginas/Configuracion'

// NavBar y TaskForm necesitan crearTarea — los sacamos a un componente interno
// que ya vive dentro del TasksProvider y puede consumir el contexto.
function AppShell() {
  const location      = useLocation()
  const sinNavbar     = ['/', '/auth']
  const mostrarNavbar = !sinNavbar.includes(location.pathname)

  const { crearTarea } = useTasksContext()
  const [formAbierto, setFormAbierto] = useState(false)

  const handleCrear = async (formData) => crearTarea(formData)

  return (
    <>
      {mostrarNavbar && <NavBar onAdd={() => setFormAbierto(true)} />}

      <TaskForm
        open={formAbierto}
        onClose={() => setFormAbierto(false)}
        onSubmit={handleCrear}
      />

      <main className={mostrarNavbar ? 'tp-page-content' : ''}>
        <Routes>
          {/* ── Públicas ── */}
          <Route path="/"     element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* ── Protegidas ── */}
          <Route path="/inicio"        element={<RutaProtegida><Inicio /></RutaProtegida>} />
          <Route path="/mascota"       element={<RutaProtegida><Mascota /></RutaProtegida>} />
          <Route path="/pendientes"    element={<RutaProtegida><Pendientes /></RutaProtegida>} />
          <Route path="/calendario"    element={<RutaProtegida><Calendario /></RutaProtegida>} />
          <Route path="/configuracion" element={<RutaProtegida><Configuracion /></RutaProtegida>} />
        </Routes>
      </main>

      <PWABadge />
    </>
  )
}

export default function App() {
  return (
    // TasksProvider envuelve todo: una sola instancia de useTasks en toda la app
    <TasksProvider>
      <AppShell />
    </TasksProvider>
  )
}
