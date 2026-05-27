// logica del auth
// guardar sesion activa en localstorage
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const navigate = useNavigate()
  const [usuarioActivo, setUsuarioActivo] = useState(null)
  const [cargando, setCargando] = useState(true)


  useEffect(() => { //------------------------------------------------------ checa si hay una sesion activa/guardada 
    const sesion = localStorage.getItem('usuarioActivo') //----------------- Sesion obtiene el almacen de usuarioActivo
    if (sesion) {
      setUsuarioActivo(JSON.parse(sesion))
    }
    setCargando(false)
  }, [])
//------------------------------------------------------------------------------------------------------------------------- INICIAR SESION
  function login(usuario, contrasena) { 
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]') //------------- informacion de usuarios en el localstorage
    const encontrado = usuarios.find( //------------------------------------------------- buscar usuario/contraseña
      (u) => u.usuario === usuario && u.contrasena === contrasena
    )

    if (!encontrado) { //----------------------------------------------------------------- No existe usuario/contraseña
      return { ok: false, error: 'Usuario o contraseña incorrectos.' }
    }

    localStorage.setItem('usuarioActivo', JSON.stringify(encontrado)) //------------------ Usuario existe
    setUsuarioActivo(encontrado) 
    navigate('/inicio') 
    return { ok: true } //---------------------------------------------------------------- se marca como usuarioactivo y navega al home
  }
//------------------------------------------------------------------------------------------------------------------------- REGISTRARSE
  function registro(usuario, correo, contrasena) {
    if (!usuario || !correo || !contrasena) { //------------------------------------ Si algun campo falta de llenar
      return { ok: false, error: 'Por favor completa todos los campos.' }
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]') //--------- informacion de usuarios en el localstorage
    const existe = usuarios.find( //------------------------------------------------- buscar usuario/correo
      (u) => u.usuario === usuario || u.correo === correo
    )

    if (existe) { //----------------------------------------------------------------- Si ya existe usuario/correo
      return { ok: false, error: 'El usuario o correo ya están registrados.' }
    }

    const nuevoUsuario = { usuario, correo, contrasena } //-------------------------- Se inserta los datos del nuevo usuario
    usuarios.push(nuevoUsuario) //--------------------------------------------------- Se guarda los datos en usuarios
    localStorage.setItem('usuarios', JSON.stringify(usuarios)) //-------------------- Se almacena los datos de usuarios a usuarios
    localStorage.setItem('usuarioActivo', JSON.stringify(nuevoUsuario)) //----------- Se almacena los datos de nuevousuario a usuarioactivo
    setUsuarioActivo(nuevoUsuario)
    navigate('/inicio')
    return { ok: true } //------------------------------------------------------------ se marca como usuarioactivo y navega al home
  }
//------------------------------------------------------------------------------------------------------------------------- CERRAR SESION
  function logout() {
    localStorage.removeItem('usuarioActivo') 
    setUsuarioActivo(null)
    navigate('/')
  }

  const estaLogueado = usuarioActivo !== null

  return { usuarioActivo, estaLogueado, cargando, login, registro, logout }
}