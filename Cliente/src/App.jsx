// App.jsx — conecta el estado del formulario entre Navbar y Pendientes
import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import PWABadge from './PWABadge.jsx'
import './App.css'

import Navbar        from './componentes/NavBar'
import RutaProtegida from './componentes/RutaProtegida'

import Landing       from './Paginas/Landing.jsx'
import Auth          from './Paginas/Auth.jsx'
import Inicio        from './Paginas/Inicio.jsx'
import Mascota       from './Paginas/Mascota.jsx'
import Pendientes    from './Paginas/Pendientes.jsx'
import Calendario    from './Paginas/Calendario.jsx'
import Configuracion from './Paginas/Configuracion.jsx'

export default function App() {
  const location = useLocation()

  // Estado global del formulario — lo abre el Navbar, lo consume Pendientes
  const [formAbierto, setFormAbierto] = useState(false)

  const sinNavbar    = ['/', '/auth']
  const mostrarNavbar = !sinNavbar.includes(location.pathname)

  return (
    <>
      {mostrarNavbar && (
        <Navbar onAdd={() => setFormAbierto(true)} />
      )}

      <main className={mostrarNavbar ? 'tp-page-content' : ''}>
        <Routes>
          {/* ── Públicas ── */}
          <Route path="/"     element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* ── Protegidas ── */}
          <Route path="/inicio" element={
            <RutaProtegida><Inicio /></RutaProtegida>
          } />
          <Route path="/mascota" element={
            <RutaProtegida><Mascota /></RutaProtegida>
          } />
          <Route path="/pendientes" element={
            <RutaProtegida>
              <Pendientes
                showForm={formAbierto}
                onCloseForm={() => setFormAbierto(false)}
              />
            </RutaProtegida>
          } />
          <Route path="/calendario" element={
            <RutaProtegida><Calendario /></RutaProtegida>
          } />
          <Route path="/configuracion" element={
            <RutaProtegida><Configuracion /></RutaProtegida>
          } />
        </Routes>
      </main>

      <PWABadge />
    </>
  )
}
