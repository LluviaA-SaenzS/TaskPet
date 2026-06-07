import React from 'react';
import '../Estilos/Mascota.css';

const Mascota = () => {
  return (
    <div className="mascota-container">
      {/* Cabecera central */}
      <div className="mascota-header">
        <h1 className="mascota-title">Mi Mascota</h1>
        <h2 className="mascota-name">P A C O</h2>
      </div>

      <div className="mascota-content">
        
        {/* Columna Izquierda: Perfil y Estadísticas */}
        <div className="mascota-profile-col">
          <div className="pet-avatar-box">
            <span className="pet-level">Lv.1</span>
            {/* Placeholder para la imagen del perrito */}
            <div className="pet-image-placeholder">🐶</div>
          </div>
          
          <div className="pet-stats-card">
            {/* Salud */}
            <div className="stat-row">
              <span className="stat-icon">❤️</span>
              <span className="stat-label">Salud</span>
              <span className="stat-value">100%</span>
              <div className="stat-bar-track"><div className="stat-bar-fill salud-fill"></div></div>
            </div>
            {/* Ánimo */}
            <div className="stat-row">
              <span className="stat-icon">😊</span>
              <span className="stat-label">Animo</span>
              <span className="stat-value">100%</span>
              <div className="stat-bar-track"><div className="stat-bar-fill animo-fill"></div></div>
            </div>
            {/* Sed */}
            <div className="stat-row">
              <span className="stat-icon">💧</span>
              <span className="stat-label">Sed</span>
              <span className="stat-value">100%</span>
              <div className="stat-bar-track"><div className="stat-bar-fill sed-fill"></div></div>
            </div>
            {/* Hambre */}
            <div className="stat-row">
              <span className="stat-icon">🦴</span>
              <span className="stat-label">Hambre</span>
              <span className="stat-value">100%</span>
              <div className="stat-bar-track"><div className="stat-bar-fill hambre-fill"></div></div>
            </div>
            {/* Sueño */}
            <div className="stat-row">
              <span className="stat-icon">🌙</span>
              <span className="stat-label">Sueño</span>
              <span className="stat-value">100%</span>
              <div className="stat-bar-track"><div className="stat-bar-fill sueno-fill"></div></div>
            </div>
          </div>

          {/* Barra inferior de experiencia */}
          <div className="pet-exp-bar">
            <div className="exp-fill"></div>
          </div>
        </div>

        {/* Columna Derecha: Tareas Especiales */}
        <div className="mascota-tasks-col">
          <div className="tasks-col-header">
            <h3>Tareas Especiales</h3>
            <div className="tasks-meta">
              <span>0/3</span>
              <span>00:03:45</span>
            </div>
          </div>

          <div className="special-tasks-list">
            {/* Tarea 1 */}
            <div className="special-task-card">
              <div className="st-header">
                <h4>Titulo de la tarea</h4>
                <span className="st-star">⭐</span>
              </div>
              <p className="st-desc">
                Lorem ipsum dolor sit amet consectetur adipiscing elit vel, mauris comm...
              </p>
              <div className="st-footer">
                <div className="st-circle"></div>
                <div className="st-done">
                  <span>Done</span>
                  <div className="st-checkbox"></div>
                </div>
              </div>
            </div>

            {/* Tarea 2 */}
            <div className="special-task-card">
              <div className="st-header">
                <h4>Titulo de la tarea</h4>
                <span className="st-star">⭐</span>
              </div>
              <p className="st-desc">
                Lorem ipsum dolor sit amet consectetur adipiscing elit vel, mauris comm...
              </p>
              <div className="st-footer">
                <div className="st-circle"></div>
                <div className="st-done">
                  <span>Done</span>
                  <div className="st-checkbox"></div>
                </div>
              </div>
            </div>

            {/* Tarea 3 */}
            <div className="special-task-card">
              <div className="st-header">
                <h4>Titulo de la tarea</h4>
                <span className="st-star">⭐</span>
              </div>
              <p className="st-desc">
                Lorem ipsum dolor sit amet consectetur adipiscing elit vel, mauris comm...
              </p>
              <div className="st-footer">
                <div className="st-circle"></div>
                <div className="st-done">
                  <span>Done</span>
                  <div className="st-checkbox"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Mascota;