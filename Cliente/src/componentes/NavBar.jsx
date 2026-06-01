// Requiere: pnpm add lucide-react
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Settings, ClipboardList, PawPrint, Calendar, Plus, Menu, X } from "lucide-react";
import "./NavBar.css";
import { Icon } from "lucide-react";

function BubbleMenu({ open, direction, onClose, active, onNavigate }) {
  const items = [
      { id: "/inicio",        label: "Home",         Icon: Home },
  { id: "/configuracion", label: "Configuración", Icon: Settings },
  ];

  const ordered = direction === "up" ? [...items].reverse() : items;

  return (
    <>
      {open && (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
      )}
      <div className={`tp-bubble-menu ${direction}${open ? " open" : ""}`}>
        {ordered.map(({ id, label, Icon }, i) => (
          <button
            key={id}
            className={`tp-bubble-item${open ? " visible" : ""}${active === id ? " active" : ""}`}
            style={{ transitionDelay: open ? `${i * 0.05}s` : "0s" }}
            title={label}
            aria-label={label}
            onClick={() => { onNavigate(id); onClose(); }}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    </>
  );
}

export default function NavBar({ onAdd }) {
  const navigate = useNavigate();
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [activeNav,  setActiveNav]  = useState("/");

  const navItems = [
    { id: "/pendientes", label: "Pendientes", Icon: ClipboardList },
  { id: "/mascota",    label: "Mascota",    Icon: PawPrint },
  { id: "/calendario", label: "Calendario", Icon: Calendar },
  ];

  const handleNavigate = (id) => {
    setActiveNav(id);
    navigate(id);
  };

  const BurgerButton = ({ direction }) => (
    <div style={{ position: "relative" }}>
      <button
        className="tp-btn tp-burger"
        aria-label={bubbleOpen ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setBubbleOpen((v) => !v)}
      >
        {bubbleOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <BubbleMenu
        open={bubbleOpen}
        direction={direction}
        onClose={() => setBubbleOpen(false)}
        active={activeNav}
        onNavigate={handleNavigate}
      />
    </div>
  );

  const PillNav = () => (
    <nav className="tp-pill" aria-label="Navegación">
      {navItems.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`tp-btn tp-pill-btn${activeNav === id ? " active" : ""}`}
          aria-label={label}
          onClick={() => handleNavigate(id)}
        >
          <Icon size={17} />
          <span className="tp-label">{label}</span>
        </button>
      ))}
    </nav>
  );

  const AddButton = () => (
    <button
      className="tp-btn tp-add"
      aria-label="Agregar tarea"
      
      onClick={onAdd}
      
    >
      <Plus size={22} />
    </button>
  );

  return (
    <>
      {/* ── Web: barra superior centrada ── */}
      <header className="tp-web">
        <BurgerButton direction="down" />
        <PillNav />
        <AddButton />
      </header>

      {/* ── Móvil: barra inferior ── */}
      <nav className="tp-mob" aria-label="Navegación principal">
        <BurgerButton direction="up" />
        <PillNav />
        <AddButton />
      </nav>
    </>
  );
}
