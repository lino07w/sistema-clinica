import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Can from './Can';
import ThemeToggle from './ThemeToggle';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isMedico, isRecepcionista } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getRoleInfo = () => {
    if (isAdmin()) return { icon: '🔑', label: 'Admin', color: '#DC2626' };
    if (isMedico()) return { icon: '👨‍⚕️', label: 'Médico', color: '#10B981' };
    if (isRecepcionista()) return { icon: '📋', label: 'Recepcionista', color: '#3B82F6' };
    return { icon: '🧑', label: 'Usuario', color: '#64748B' };
  };

  const roleInfo = getRoleInfo();

  return (
    <>
      {/* Overlay para móvil */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Botón hamburguesa (solo móvil) */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => handleNavigate('/dashboard')}>
            <span className="sidebar-logo-icon">🏥</span>
            <span className="sidebar-logo-text">Sistema Clínica</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <ThemeToggle />
            <button
              className="sidebar-collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="sidebar-user-info">
          <div
            className="sidebar-user-avatar"
            style={{ background: roleInfo.color }}
          >
            {roleInfo.icon}
          </div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-name">
              {user?.nombre || user?.username}
            </span>
            <span
              className="sidebar-user-role"
              style={{ color: roleInfo.color }}
            >
              {roleInfo.label}
            </span>
          </div>
        </div>

        {/* Navigation - ADMIN */}
        <Can roles={['administrador']}>
          <nav className="sidebar-nav">
            <button
              className={`sidebar-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => handleNavigate('/dashboard')}
            >
              <span className="sidebar-nav-icon">📊</span>
              <span className="sidebar-nav-label">Dashboard</span>
            </button>

            <button
              className={`sidebar-nav-item ${isActive('/usuarios') ? 'active' : ''}`}
              onClick={() => handleNavigate('/usuarios')}
            >
              <span className="sidebar-nav-icon">👥</span>
              <span className="sidebar-nav-label">Usuarios</span>
            </button>

            <button
              className={`sidebar-nav-item ${isActive('/solicitudes') ? 'active' : ''}`}
              onClick={() => handleNavigate('/solicitudes')}
            >
              <span className="sidebar-nav-icon">⏳</span>
              <span className="sidebar-nav-label">Solicitudes</span>
            </button>

            <button
              className={`sidebar-nav-item ${isActive('/reportes') ? 'active' : ''}`}
              onClick={() => handleNavigate('/reportes')}
            >
              <span className="sidebar-nav-icon">📈</span>
              <span className="sidebar-nav-label">Reportes</span>
            </button>

            <button
              className={`sidebar-nav-item ${isActive('/pacientes') ? 'active' : ''}`}
              onClick={() => handleNavigate('/pacientes')}
            >
              <span className="sidebar-nav-icon">🧑</span>
              <span className="sidebar-nav-label">Pacientes</span>
            </button>

            <button
              className={`sidebar-nav-item ${isActive('/medicos') ? 'active' : ''}`}
              onClick={() => handleNavigate('/medicos')}
            >
              <span className="sidebar-nav-icon">👨‍⚕️</span>
              <span className="sidebar-nav-label">Médicos</span>
            </button>

            <button
              className={`sidebar-nav-item ${isActive('/citas') ? 'active' : ''}`}
              onClick={() => handleNavigate('/citas')}
            >
              <span className="sidebar-nav-icon">📅</span>
              <span className="sidebar-nav-label">Citas</span>
            </button>

            <button
              className={`sidebar-nav-item ${isActive('/facturacion') ? 'active' : ''}`}
              onClick={() => handleNavigate('/facturacion')}
            >
              <span className="sidebar-nav-icon">💰</span>
              <span className="sidebar-nav-label">Facturación</span>
            </button>

            <button
              className={`sidebar-nav-item ${isActive('/historial') ? 'active' : ''}`}
              onClick={() => handleNavigate('/historial')}
            >
              <span className="sidebar-nav-icon">📋</span>
              <span className="sidebar-nav-label">Historial Médico</span>
            </button>

            <button
              className={`sidebar-nav-item ${isActive('/auditoria') ? 'active' : ''}`}
              onClick={() => handleNavigate('/auditoria')}
            >
              <span className="sidebar-nav-icon">🔍</span>
              <span className="sidebar-nav-label">Auditoría</span>
            </button>

            <button
              className={`sidebar-nav-item ${isActive('/configuracion') ? 'active' : ''}`}
              onClick={() => handleNavigate('/configuracion')}
            >
              <span className="sidebar-nav-icon">⚙️</span>
              <span className="sidebar-nav-label">Configuración</span>
            </button>
          </nav>
        </Can>

        {/* Navigation - RECEPCIONISTA */}
        <Can roles={['recepcionista']}>
          <nav className="sidebar-nav">
            <button
              className={`sidebar-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => handleNavigate('/dashboard')}
            >
              <span className="sidebar-nav-icon">📊</span>
              <span className="sidebar-nav-label">Dashboard</span>
            </button>

            <button
              className={`sidebar-nav-item ${isActive('/pacientes') ? 'active' : ''}`}
              onClick={() => handleNavigate('/pacientes')}
            >
              <span className="sidebar-nav-icon">🧑</span>
              <span className="sidebar-nav-label">Pacientes</span>
            </button>

            <button
              className={`sidebar-nav-item ${isActive('/citas') ? 'active' : ''}`}
              onClick={() => handleNavigate('/citas')}
            >
              <span className="sidebar-nav-icon">📅</span>
              <span className="sidebar-nav-label">Citas</span>
            </button>
          </nav>
        </Can>

        {/* Navigation - MÉDICO */}
        <Can roles={['medico']}>
          <nav className="sidebar-nav">
            <button
              className={`sidebar-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => handleNavigate('/dashboard')}
            >
              <span className="sidebar-nav-icon">📊</span>
              <span className="sidebar-nav-label">Dashboard</span>
            </button>

            <button
              className={`sidebar-nav-item ${isActive('/citas') ? 'active' : ''}`}
              onClick={() => handleNavigate('/citas')}
            >
              <span className="sidebar-nav-icon">📅</span>
              <span className="sidebar-nav-label">Mis Citas</span>
            </button>

            <button
              className={`sidebar-nav-item ${isActive('/historial') ? 'active' : ''}`}
              onClick={() => handleNavigate('/historial')}
            >
              <span className="sidebar-nav-icon">📋</span>
              <span className="sidebar-nav-label">Historial Médico</span>
            </button>
          </nav>
        </Can>

        {/* Logout button */}
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <span className="sidebar-nav-icon">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </aside>
    </>
  );
};

export default Navbar;