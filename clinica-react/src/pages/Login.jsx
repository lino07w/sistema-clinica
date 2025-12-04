import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    const result = await login(username, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Error al iniciar sesión');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>⚕️</div>
          <h1 style={styles.title}>Sistema Clínica</h1>
          <p style={styles.subtitle}>Ingrese sus credenciales para acceder</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Usuario</label>
            <input
              type="text"
              style={styles.input}
              placeholder="Ingrese su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              style={styles.input}
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={styles.footer}>
          <small>Usuario demo: <strong>admin</strong> / Contraseña: <strong>123456</strong></small>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
    overflow: 'auto',
  },
  card: {
    background: 'white',
    padding: '3rem',
    borderRadius: '1.5rem',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '480px',
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  icon: {
    width: '80px',
    height: '80px',
    margin: '0 auto 1.5rem',
    background: 'linear-gradient(135deg, #0A4D68, #00C9A7)',
    borderRadius: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
  },
  title: { color: '#0A4D68', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '700' },
  subtitle: { color: '#64748B', fontSize: '1rem' },
  formGroup: { marginBottom: '1.5rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1E293B', fontSize: '0.95rem' },
  input: {
    width: '100%',
    padding: '1rem',
    border: '2px solid #E2E8F0',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  error: {
    background: '#FEE2E2',
    color: '#991B1B',
    padding: '1rem',
    borderRadius: '0.75rem',
    marginBottom: '1.5rem',
    borderLeft: '4px solid #EF4444',
  },
  button: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #0A4D68, #088395)',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  footer: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #E2E8F0',
    textAlign: 'center',
    color: '#64748B',
  },
};

export default Login;