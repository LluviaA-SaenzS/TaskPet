import { useState } from 'react'
import appLogo from '../../public/favicon.svg'
import { useNavigate } from 'react-router-dom'
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.12.1/css/all.css" crossorigin="anonymous"></link>
import '../Estilos/Inicio.css'
export default function Inicio() {
  return (
    <>
      <div className='layout'>
        <header>

          <nav>
            <ul>
              <li><a href="">Pendientes</a></li>
              <li><img src="" alt="" /><a href="">mascota</a></li>
              <li><img src="" alt="" /><a href="">calendario</a></li>

            </ul>
          </nav>

        </header>
        <aside id='usuario'>
          <h1>Hola</h1>
          <img src="" alt="" className='imgPerfil' />
          <h2> Dueño de Paco</h2>
          <div className='racha'>
            <p>dia 1</p>
          </div>
          <ul>
            <li>
              <p className='dia'>D</p>
              <div className='marca'></div>
            </li>
            <li>
              <p className='dia'>L</p>
              <div className='marca'></div>
            </li>  <li>
              <p className='dia'>M</p>
              <div className='marca'></div>
            </li>  <li>
              <p className='dia'>M</p>
              <div className='marca'></div>
            </li>  <li>
              <p className='dia'>J</p>
              <div className='marca'></div>
            </li>  <li>
              <p className='dia'>V</p>
              <div className='marca'></div>
            </li>  <li>
              <p className='dia'>S</p>
              <div className='marca'></div>
            </li>

          </ul>
        </aside>
        <main id='petLog'>

          <section className='mascota'>
            Aqui va paco
          </section>
          <section className='pendiente'><p>1</p><h4>Pendientes</h4> </section>
          <section className='completada'> <p>6</p><h4>Completadas hoy</h4></section>
          <section className='consejo'><h4>Consejos</h4> <p>Consejos para el cuidado de tu mascota</p></section>


        </main>
      </div>

    </>
  )
}


