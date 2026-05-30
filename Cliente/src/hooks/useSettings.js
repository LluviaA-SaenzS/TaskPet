// logica de configuracion de perfil y mascota
import { useState } from 'react'
import { supabase } from '../lib/supabase'


export function useSettings(usuarioActivo, perfil, mascota) {
  const [guardando, setGuardando] = useState(false)
  const [error, setError]         = useState(null)

  // ---------------------------------------------------- subir imagen a Storage
  async function subirImagen(bucket, archivo) {
    const extension = archivo.name.split('.').pop()
    const ruta      = `${usuarioActivo.id}/${bucket}.${extension}`

    const { error: errUpload } = await supabase.storage
      .from(bucket)
      .upload(ruta, archivo, { upsert: true }) // upsert: reemplaza si ya existe

    if (errUpload) return { ok: false, error: 'Error al subir la imagen.' }

    const { data } = supabase.storage.from(bucket).getPublicUrl(ruta)
    return { ok: true, url: data.publicUrl }
  }

  // ---------------------------------------------------- actualizar nombre de usuario
  async function actualizarNombre(nuevoNombre) {
    if (!nuevoNombre?.trim()) {
      return { ok: false, error: 'El nombre no puede estar vacío.' }
    }

    setGuardando(true)
    setError(null)

    const { error: err } = await supabase
      .from('usuarios')
      .update({ usuario: nuevoNombre.trim() })
      .eq('id_auth', usuarioActivo.id)

    setGuardando(false)

    if (err) {
      if (err.code === '23505') return { ok: false, error: 'Ese nombre de usuario ya existe.' }
      return { ok: false, error: 'Error al actualizar el nombre.' }
    }

    return { ok: true }
  }

  // ---------------------------------------------------- actualizar avatar
  async function actualizarAvatar(archivo) {
    if (!archivo) return { ok: false, error: 'No se seleccionó ninguna imagen.' }

    setGuardando(true)
    setError(null)

    const { ok, url, error: errSubida } = await subirImagen('avatares', archivo)
    if (!ok) { setGuardando(false); return { ok: false, error: errSubida } }

    const { error: err } = await supabase
      .from('usuarios')
      .update({ avatar_url: url })
      .eq('id_auth', usuarioActivo.id)

    setGuardando(false)
    if (err) return { ok: false, error: 'Error al guardar el avatar.' }

    return { ok: true, url }
  }

  // ---------------------------------------------------- actualizar nombre de mascota
  async function actualizarNombreMascota(nuevoNombre) {
    if (!nuevoNombre?.trim()) {
      return { ok: false, error: 'El nombre no puede estar vacío.' }
    }

    setGuardando(true)
    setError(null)

    const { error: err } = await supabase
      .from('mascotas')
      .update({ nombre: nuevoNombre.trim() })
      .eq('id_usuario', perfil.id_usuario)

    setGuardando(false)
    if (err) return { ok: false, error: 'Error al actualizar el nombre de la mascota.' }

    return { ok: true }
  }

  // ---------------------------------------------------- actualizar imagen de mascota
  async function actualizarImagenMascota(archivo) {
    if (!archivo) return { ok: false, error: 'No se seleccionó ninguna imagen.' }

    setGuardando(true)
    setError(null)

    const { ok, url, error: errSubida } = await subirImagen('mascotas', archivo)
    if (!ok) { setGuardando(false); return { ok: false, error: errSubida } }

    const { error: err } = await supabase
      .from('mascotas')
      .update({ imagen_url: url })
      .eq('id_usuario', perfil.id_usuario)

    setGuardando(false)
    if (err) return { ok: false, error: 'Error al guardar la imagen de la mascota.' }

    return { ok: true, url }
  }

  // ---------------------------------------------------- eliminar cuenta
  async function eliminarCuenta() {
    setGuardando(true)
    setError(null)

    // Eliminar imagenes del storage
    await supabase.storage.from('avatares').remove([`${usuarioActivo.id}/avatares`])
    await supabase.storage.from('mascotas').remove([`${usuarioActivo.id}/mascotas`])

    // Eliminar usuario de Auth (cascade elimina el resto por las FK)
    const { error: err } = await supabase.rpc('eliminar_cuenta')

    setGuardando(false)
    if (err) return { ok: false, error: 'Error al eliminar la cuenta.' }

    return { ok: true }
  }

  return {
    guardando,
    error,
    actualizarNombre,
    actualizarAvatar,
    actualizarNombreMascota,
    actualizarImagenMascota,
    eliminarCuenta,
  }
}
