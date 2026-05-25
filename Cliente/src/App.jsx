import { Routes, Route } from 'react-router-dom'
import PWABadge from './PWABadge.jsx'
import './App.css'

import RutaProtegida from './componentes/RutaProtegida'

import Landing from './paginas/Landing.jsx'
import Auth from './paginas/Auth.jsx'
import Inicio from './paginas/Inicio.jsx'
import Mascota from './paginas/Mascota.jsx'
import Pendientes from './paginas/Pendientes.jsx'
import Calendario from './paginas/Calendario.jsx'
import Configuracion from './paginas/Configuracion.jsx'


 function App() {
  return (
    <>
      <Routes>
            {/* ----------------------------------------------------------------------- RUTAS PUBLICAS (sin necesidad del auth) */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
      
            {/* ----------------------------------------------------------------------- RUTAS PROTEGIDAS (con auth) */}
            <Route path="/inicio" element={
              <RutaProtegida><Inicio /></RutaProtegida>
            } />
            <Route path="/mascota" element={
              <RutaProtegida><Mascota /></RutaProtegida>
            } />
            <Route path="/pendientes" element={
              <RutaProtegida><Pendientes /></RutaProtegida>
            } />
            <Route path="/calendario" element={
              <RutaProtegida><Calendario /></RutaProtegida>
            } />
            <Route path="/configuracion" element={
              <RutaProtegida><Configuracion /></RutaProtegida>
            } />
          </Routes>
      <PWABadge />
    </>
  )
}
export default App
