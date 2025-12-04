import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin, isRecepcionista, isMedico } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
      logout();
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.navbar}>
      <div style={styles.content}>
        <Link to="/" style={styles.brand}>
          <span style={styles.brandIcon}>⚕️</span>
          <span style={styles.brandText}>Sistema Clínica</span>
        </Link>
        
        <div style={styles.menu}>
          <Link to="/" style={{...styles.link, ...(isActive('/') && styles.linkActive)}}>
            Dashboard
          </Link>

          {/* Admin y Recepcionista ven Pacientes */}
          {(isAdmin() || isRecepcionista()) && (
            <Link to="/pacientes" style={{...styles.link, ...(isActive('/pacientes') && styles.linkActive)}}>
              Pacientes
            </Link>
          )}

          {/* Solo Admin ve Médicos */}
          {isAdmin() && (
            <Link to="/medicos" style={{...styles.link, ...(isActive('/medicos') && styles.linkActive)}}>
              Médicos
            </Link>
          )}

          {/* Admin, Recepcionista y Médico ven Citas */}
          {(isAdmin() || isRecepcionista() || isMedico()) && (
            <Link to="/citas" style={{...styles.link, ...(isActive('/citas') && styles.linkActive)}}>
              Citas
            </Link>
          )}

          {/* Paciente ve Mis Citas */}
          {/* {isPaciente() && (
            <Link to="/mis-citas" style={{...styles.link, ...(isActive('/mis-citas') && styles.linkActive)}}>
              Mis Citas
            </Link>
          )} */}
        </div>

        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <span style={styles.username}>👤 {user?.nombre || user?.username}</span>
            <span style={styles.role}>{getRoleLabel(user?.rol)}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};

const getRoleLabel = (rol) => {
  const labels = {
    administrador: '🔑 Admin',
    medico: '👨‍⚕️ Médico',
    recepcionista: '📋 Recepción',
    paciente: '🧑 Paciente'
  };
  return labels[rol] || rol;
};

const styles = {
  navbar: {
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    width: '100%',
  },
  content: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    width: '100%',
    maxWidth: '100%',
    margin: '0 auto',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0A4D68',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  brandIcon: {
    fontSize: '1.75rem',
  },
  brandText: {
    display: 'inline',
  },
  menu: {
    display: 'flex',
    gap: '0.25rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  link: {
    textDecoration: 'none',
    color: '#64748B',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    transition: 'all 0.2s',
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
  },
  linkActive: {
    background: 'rgba(10, 77, 104, 0.1)',
    color: '#0A4D68',
  },
  userSection: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  username: {
    color: '#1E293B',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  role: {
    color: '#64748B',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    background: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
  },
};

export default Navbar;