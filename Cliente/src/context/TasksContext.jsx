// context/TasksContext.jsx
// Una sola instancia de useTasks compartida en toda la app.
// App.jsx provee el contexto; cualquier página lo consume con useTasksContext().

import { createContext, useContext } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useAuth }    from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useStreak }  from '../hooks/useStreak'

const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  const { usuarioActivo }  = useAuth()
  const { perfil }         = useProfile(usuarioActivo)
  const { registrarActividad } = useStreak(perfil?.id_usuario)

  const tasks = useTasks(perfil?.id_usuario, {
    onTareaCompletada: registrarActividad,
  })

  return (
    <TasksContext.Provider value={tasks}>
      {children}
    </TasksContext.Provider>
  )
}

export function useTasksContext() {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error('useTasksContext debe usarse dentro de TasksProvider')
  return ctx
}
