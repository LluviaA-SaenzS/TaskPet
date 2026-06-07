import React from 'react';
import '../Estilos/Pendientes.css';

const Pendientes = () => {
  return (
    <div className="pendientes-container">
      
      {/* Panel Izquierdo: Filtros / Categorías */}
      <div className="pendientes-sidebar">
        <div className="filter-item active">
          <span className="filter-circle"></span> Trabajo
        </div>
        <div className="filter-item active">
          <span className="filter-circle"></span> Hoy
        </div>
        <div className="filter-item">
          <span className="filter-circle"></span> Reunion
        </div>
        <div className="filter-item">
          <span className="filter-circle"></span> Otros
        </div>
        <div className="filter-item">
          <span className="filter-circle"></span> Vacaciones
        </div>
      </div>

      {/* Panel Derecho: Lista de Tareas */}
      <div className="pendientes-main">
        <h1 className="pendientes-title">Mis Tareas</h1>
        
        <div className="tareas-list">
          
          {/* Tarjeta 1 */}
          <div className="tarea-card">
            <div className="tarea-header">
              <h3>Titulo de la tarea</h3>
              <span className="tarea-options">•••</span>
            </div>
            <p className="tarea-desc">
              Lorem ipsum dolor sit amet consectetur adipiscing elit vel, mauris commodo est nibh purus risus luctus, nostra hendrerit praesent phasellus fames lobortis bibendum.
              Netus accumsan lacus aliquam luctus auctor congue suspendisse felis dictumst quam himenaeos, montes phasellus arcu in nulla elementum dictum mauris nibh.
            </p>
            <div className="tarea-footer">
              <div className="tarea-tags">
                <span className="tag-circle"></span>
                <span className="tag-circle"></span>
                <span className="tag-circle"></span>
              </div>
              <div className="tarea-done">
                <span>Done</span>
                <div className="done-checkbox"></div>
              </div>
            </div>
          </div>

          {/* Tarjeta 2 */}
          <div className="tarea-card">
            <div className="tarea-header">
              <h3>Titulo de la tarea</h3>
              <span className="tarea-options">•••</span>
            </div>
            <p className="tarea-desc">
              Lorem ipsum dolor sit amet consectetur adipiscing elit vel, mauris commodo est nibh purus risus luctus, nostra hendrerit praesent phasellus fames lobort...
            </p>
            <div className="tarea-footer">
              <div className="tarea-tags">
                <span className="tag-circle"></span>
              </div>
              <div className="tarea-done">
                <span>Done</span>
                <div className="done-checkbox"></div>
              </div>
            </div>
          </div>

          {/* Tarjeta 3 */}
          <div className="tarea-card">
            <div className="tarea-header">
              <h3>Titulo de la tarea</h3>
              <span className="tarea-options">•••</span>
            </div>
            <p className="tarea-desc"></p>
            <div className="tarea-footer">
              <div className="tarea-tags">
                <span className="tag-circle"></span>
                <span className="tag-circle"></span>
              </div>
              <div className="tarea-done">
                <span>Done</span>
                <div className="done-checkbox"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Pendientes;