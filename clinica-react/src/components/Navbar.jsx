import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  CalendarDays,
  Users,
  FileHeart,
  Receipt,
  BarChart3,
  Stethoscope,
  UserCog,
  UserPlus,
  ScrollText,
  Settings,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Cross,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import '../styles/Navbar.css';

const COLLAPSED_KEY = 'sidebar-collapsed';

/**
 * Navegación agrupada por tarea. Los roles coinciden con los de App.jsx:
 * cada rol sólo ve las secciones a las que puede entrar.
 */
const NAV_GROUPS = [
  {
    title: 'Atención',
    items: [
      { to: '/dashboard', label: 'Agenda', icon: CalendarClock, roles: ['administrador', 'recepcionista', 'medico'] },
      { to: '/citas', label: 'Citas', medicoLabel: 'Mis citas', icon: CalendarDays, roles: ['administrador', 'recepcionista', 'medico'] },
      { to: '/pacientes', label: 'Pacientes', icon: Users, roles: ['administrador', 'recepcionista'] },
      { to: '/historial', label: 'Historial médico', icon: FileHeart, roles: ['administrador', 'medico'] },
      { to: '/facturacion', label: 'Facturación', icon: Receipt, roles: ['administrador', 'recepcionista'] },
    ],
  },
  {
    title: 'Administración',
    items: [
      { to: '/reportes', label: 'Reportes', icon: BarChart3, roles: ['administrador'] },
      { to: '/medicos', label: 'Médicos', icon: Stethoscope, roles: ['administrador'] },
      { to: '/usuarios', label: 'Usuarios', icon: UserCog, roles: ['administrador'] },
      { to: '/solicitudes', label: 'Solicitudes de acceso', icon: UserPlus, roles: ['administrador'] },
      { to: '/auditoria', label: 'Auditoría', icon: ScrollText, roles: ['administrador'] },
      { to: '/configuracion', label: 'Configuración', icon: Settings, roles: ['administrador'] },
    ],
  },
];

const ROLE_LABELS = {
  administrador: 'Administrador',
  medico: 'Médico',
  recepcionista: 'Recepción',
  paciente: 'Paciente',
};

const initials = (name = '') =>
  name
    .replace(/^(Dr\.?|Dra\.?)\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const rol = user?.rol;
  const displayName = user?.nombre || user?.username || '';

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_KEY, String(next));
      } catch {
        /* almacenamiento no disponible: sólo afecta a la preferencia */
      }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(rol)),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <div
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Barra superior sólo en móvil */}
      <header className="mobile-topbar">
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={mobileOpen}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <span className="sidebar-brand">
          <span className="sidebar-brand-mark" aria-hidden="true">
            <Cross size={16} strokeWidth={2.5} />
          </span>
          <span className="sidebar-brand-name">Clínica</span>
        </span>
      </header>

      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Navegación principal"
      >
        <div className="sidebar-header">
          <span className="sidebar-brand">
            <span className="sidebar-brand-mark" aria-hidden="true">
              <Cross size={16} strokeWidth={2.5} />
            </span>
            <span className="sidebar-brand-name">Clínica</span>
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-icon sidebar-collapse-btn"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
            title={collapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {groups.map((group) => (
            <div className="sidebar-group" key={group.title}>
              <p className="sidebar-group-title">{group.title}</p>
              <ul>
                {group.items.map(({ to, label, medicoLabel, icon }) => {
                  const Icon = icon;
                  const text = rol === 'medico' && medicoLabel ? medicoLabel : label;
                  return (
                    <li key={to}>
                      <NavLink
                        to={to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? text : undefined}
                      >
                        <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                        <span className="sidebar-link-label">{text}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-avatar" aria-hidden="true">{initials(displayName)}</span>
            <span className="sidebar-user-text">
              <span className="sidebar-user-name">{displayName}</span>
              <span className="sidebar-user-role">{ROLE_LABELS[rol] ?? 'Usuario'}</span>
            </span>
          </div>
          <div className="sidebar-actions">
            <ThemeToggle />
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
