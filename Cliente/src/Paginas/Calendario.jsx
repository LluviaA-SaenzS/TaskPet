import React from 'react';
import '../Estilos/Calendario.css';

const Calendar = () => {
  // Generamos 35 celdas para la cuadrícula base (5 semanas x 7 días)
  const emptyCells = Array.from({ length: 35 });

  return (
    <div className="calendar-container">
      {/* Panel izquierdo: Navegación y Leyenda */}
      <div className="calendar-sidebar">
        <div className="month-navigator">
          <span className="nav-arrow">&lt;</span>
          <h2 className="current-month">Abril 2026</h2>
          <span className="nav-arrow">&gt;</span>
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-checkbox"></div>
            <span>Dia actual</span>
          </div>
          <div className="legend-item">
            <div className="legend-checkbox"></div>
            <span>Tarea pendiente</span>
          </div>
          <div className="legend-item">
            <div className="legend-checkbox"></div>
            <span>Tarea completada</span>
          </div>
        </div>
      </div>

      {/* Panel derecho: Cuadrícula del mes */}
      <div className="calendar-main">
        <div className="days-header">
          <span>D</span>
          <span>L</span>
          <span>M</span>
          <span>M</span>
          <span>J</span>
          <span>V</span>
          <span>S</span>
        </div>
        
        <div className="calendar-grid">
          {emptyCells.map((_, index) => (
            <div 
              key={index} 
              className={`calendar-cell ${index >= 33 ? 'cell-empty' : ''}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;