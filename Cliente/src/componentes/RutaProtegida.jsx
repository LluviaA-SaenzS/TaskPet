// ¿inicio de sesion activo? (local)
// si -> lo manda a /home
// no -> lo manda al auth

import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RutaProtegida({ children }) {
  const { estaLogueado, cargando } = useAuth()

  if (cargando) return null

  if (!estaLogueado) return <Navigate to="/auth" replace />

  return children
}
