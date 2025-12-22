import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas/authSchema';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const { register, handleSubmit, formState: { errors, instanceId }, setError: setFormError } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setGlobalError('');
    setLoading(true);

    try {
      // Mapear campos de RHF a lo que espera el context
      const loginPayload = {
        usernameOrEmail: data.identificador,
        password: data.password
      };

      console.log('🔐 Intentando login...'); // DEBUG
      await login(loginPayload);
      console.log('✅ Login exitoso, redirigiendo...'); // DEBUG
      addToast('Bienvenido de nuevo', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Error en login:', err); // DEBUG
      const msg = err.response?.data?.message || 'Error al iniciar sesión';
      setGlobalError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Sistema de Clínica</h1>
          <p style={styles.subtitle}>Inicia sesión en tu cuenta</p>
        </div>

        {globalError && (
          <div style={styles.error}>
            ⚠️ {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Usuario o Email</label>
            <input
              style={{ ...styles.input, borderColor: errors.identificador ? '#DC2626' : '#E2E8F0' }}
              type="text"
              placeholder="Ingresa tu usuario o email"
              {...register('identificador')}
              disabled={loading}
              autoFocus
            />
            {errors.identificador && (
              <span style={styles.errorText}>{errors.identificador.message}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              style={{ ...styles.input, borderColor: errors.password ? '#DC2626' : '#E2E8F0' }}
              type="password"
              placeholder="Ingresa tu contraseña"
              {...register('password')}
              disabled={loading}
            />
            {errors.password && (
              <span style={styles.errorText}>{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            ¿No tienes cuenta?{' '}
            <span
              style={styles.link}
              onClick={() => navigate('/register')}
            >
              Regístrate aquí
            </span>
          </p>
        </div>

        <div style={styles.info}>
          <p style={styles.infoTitle}>💡 Usuarios de prueba:</p>
          <ul style={styles.infoList}>
            <li><strong>Admin:</strong> admin / 123456</li>
            <li><strong>Médico:</strong> garcia@clinica.com / 123456</li>
            <li><strong>Recepcionista:</strong> recepcion@clinica.com / 123456</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
    padding: '1rem',
  },
  card: {
    background: 'white',
    padding: 'clamp(2rem, 4vw, 3rem)',
    borderRadius: '1rem',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '450px',
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
    color: '#0A4D68',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    margin: 0,
  },
  error: {
    background: '#FEE2E2',
    color: '#DC2626',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
    fontSize: 'clamp(0.875rem, 2vw, 0.95rem)',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  errorText: {
    color: '#DC2626',
    fontSize: '0.85rem',
    marginTop: '0.25rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#1E293B',
    fontWeight: '500',
    fontSize: 'clamp(0.875rem, 2vw, 0.95rem)',
  },
  input: {
    width: '100%',
    padding: 'clamp(0.75rem, 2vw, 1rem)',
    border: '2px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  button: {
    width: '100%',
    padding: 'clamp(0.75rem, 2vw, 1rem)',
    background: 'linear-gradient(135deg, #0A4D68, #088395)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'transform 0.2s',
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 'clamp(0.875rem, 2vw, 0.95rem)',
    margin: 0,
  },
  link: {
    color: '#0A4D68',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  info: {
    marginTop: '2rem',
    padding: '1rem',
    background: '#F8FAFC',
    borderRadius: '0.5rem',
    border: '1px solid #E2E8F0',
  },
  infoTitle: {
    fontSize: 'clamp(0.875rem, 2vw, 0.95rem)',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '0.5rem',
  },
  infoList: {
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    color: '#64748B',
    paddingLeft: '1.25rem',
    margin: 0,
    lineHeight: '1.8',
  },
};

export default Login;