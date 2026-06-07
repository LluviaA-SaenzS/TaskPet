import { useState } from 'react'
import { useAuth }     from '../hooks/useAuth'
import { useProfile }  from '../hooks/useProfile'
import { usePet }      from '../hooks/usePet'
import { useSettings } from '../hooks/useSettings'

export default function Configuracion() {
  const { usuarioActivo, logout }    = useAuth()
  const { perfil, recargar: recargarPerfil } = useProfile(usuarioActivo)
  const { mascota, recargar: recargarMascota } = usePet(perfil?.id_usuario)
  const { guardando, actualizarNombre, //actualizarAvatar,
          actualizarNombreMascota, actualizarImagenMascota,
          eliminarCuenta } = useSettings(usuarioActivo, perfil, mascota)

  // ---- estado local de los campos
  const [nuevoNombre,        setNuevoNombre]        = useState('')
  const [nuevoNombreMascota, setNuevoNombreMascota] = useState('')
  const [mensaje,            setMensaje]            = useState(null)  // { tipo: 'ok'|'error', texto }
  const [modalEliminar,      setModalEliminar]      = useState(false)

  // ---------------------------------------------------- helpers
  function mostrarMensaje(tipo, texto) {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 3000)
  }

  // ---------------------------------------------------- handlers
  async function handleNombre(e) {
    e.preventDefault()
    const { ok, error } = await actualizarNombre(nuevoNombre)
    if (ok) {
      recargarPerfil()
      setNuevoNombre('')
      mostrarMensaje('ok', 'Nombre actualizado.')
    } else {
      mostrarMensaje('error', error)
    }
  }

//  async function handleAvatar(e) {
//    const archivo = e.target.files[0]
//    if (!archivo) return
//    const { ok, error } = await actualizarAvatar(archivo)
//    if (ok) {
//      recargarPerfil()
//      mostrarMensaje('ok', 'Foto actualizada.')
//    } else {
//  mostrarMensaje('error', error)
//    }
//  }

  async function handleNombreMascota(e) {
    e.preventDefault()
    const { ok, error } = await actualizarNombreMascota(nuevoNombreMascota)
    if (ok) {
      recargarMascota()
      setNuevoNombreMascota('')
      mostrarMensaje('ok', 'Nombre de mascota actualizado.')
    } else {
      mostrarMensaje('error', error)
    }
  }

  async function handleImagenMascota(e) {
    const archivo = e.target.files[0]
    if (!archivo) return
    const { ok, error } = await actualizarImagenMascota(archivo)
    if (ok) {
      recargarMascota()
      mostrarMensaje('ok', 'Imagen de mascota actualizada.')
    } else {
      mostrarMensaje('error', error)
    }
  }

  async function handleEliminarCuenta() {
    const { ok, error } = await eliminarCuenta()
    if (ok) {
      logout()
    } else {
      setModalEliminar(false)
      mostrarMensaje('error', error)
    }
  }

  // ---------------------------------------------------- render
  return (
    <div className="configuracion">

      {/* Mensaje de feedback */}
      {mensaje && (
        <p className={`mensaje mensaje--${mensaje.tipo}`}>
          {mensaje.texto}
        </p>
      )}

      {/* ---- Seccion perfil ---- */}
      <section className="config-seccion">
        <h2>Perfil</h2>

        {/* Avatar actual */}
        {perfil?.avatar_url && (
          <img
            src={perfil.avatar_url}
            alt="Avatar"
            className="config-avatar"
          />
        )}

        {/* Cambiar foto 
        <label className="config-label">
          Cambiar foto de perfil
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatar}
            disabled={guardando}
          />
        </label>*/}

        {/* Cambiar nombre */}
        <form onSubmit={handleNombre} className="config-form">
          <label className="config-label">
            Nombre de usuario actual: <strong>{perfil?.usuario}</strong>
          </label>
          <input
            type="text"
            placeholder="Nuevo nombre de usuario"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            disabled={guardando}
          />
          <button type="submit" disabled={guardando || !nuevoNombre.trim()}>
            {guardando ? 'Guardando...' : 'Actualizar nombre'}
          </button>
        </form>
      </section>

      {/* ---- Seccion mascota ---- */}
      <section className="config-seccion">
        <h2>Mascota</h2>

        {/* Imagen actual */}
        {mascota?.imagen_url && (
          <img
            src={mascota.imagen_url}
            alt="Mascota"
            className="config-mascota-img"
          />
        )}

        {/* Cambiar imagen */}
        <label className="config-label">
          Cambiar imagen de mascota
          <input
            type="file"
            accept="image/*"
            onChange={handleImagenMascota}
            disabled={guardando}
          />
        </label>

        {/* Cambiar nombre mascota */}
        <form onSubmit={handleNombreMascota} className="config-form">
          <label className="config-label">
            Nombre actual: <strong>{mascota?.nombre}</strong>
          </label>
          <input
            type="text"
            placeholder="Nuevo nombre de mascota"
            value={nuevoNombreMascota}
            onChange={(e) => setNuevoNombreMascota(e.target.value)}
            disabled={guardando}
          />
          <button type="submit" disabled={guardando || !nuevoNombreMascota.trim()}>
            {guardando ? 'Guardando...' : 'Actualizar nombre'}
          </button>
        </form>
      </section>

      {/* ---- Seccion cuenta ---- */}
      <section className="config-seccion config-seccion--peligro">
        <h2>Cuenta</h2>

        <button onClick={logout} disabled={guardando}>
          Cerrar sesión
        </button>

        <button
          className="btn-eliminar"
          onClick={() => setModalEliminar(true)}
          disabled={guardando}
        >
          Eliminar cuenta
        </button>
      </section>

      {/* ---- Modal confirmacion eliminar ---- */}
      {modalEliminar && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>¿Eliminar cuenta?</h3>
            <p>Esta acción es permanente. Se eliminarán todos tus datos, tareas y mascota.</p>
            <div className="modal-botones">
              <button
                onClick={() => setModalEliminar(false)}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                className="btn-eliminar"
                onClick={handleEliminarCuenta}
                disabled={guardando}
              >
                {guardando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
