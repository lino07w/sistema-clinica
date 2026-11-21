import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [rol, setRol] = useState('medico');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Médico
    especialidad: '',
    matricula: '',
    // Común
    telefono: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        rol,
        telefono: formData.telefono,
      };

      // Agregar campos según el rol
      if (rol === 'medico') {
        if (!formData.especialidad || !formData.matricula) {
          setError('Especialidad y Matrícula son requeridos para médicos');
          setLoading(false);
          return;
        }
        dataToSend.especialidad = formData.especialidad;
        dataToSend.matricula = formData.matricula;
      }

      const response = await authAPI.register(dataToSend);

      if (response.data.success) {
        alert(response.data.message);
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Solicitar Acceso</h1>
        <p style={styles.subtitle}>Regístrate como profesional de la clínica</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Selector de Rol */}
          <div style={styles.rolSelector}>
            <button
              type="button"
              style={{
                ...styles.rolButton,
                ...(rol === 'medico' ? styles.rolButtonActive : {})
              }}
              onClick={() => setRol('medico')}
            >
              👨‍⚕️ Médico
            </button>
            <button
              type="button"
              style={{
                ...styles.rolButton,
                ...(rol === 'recepcionista' ? styles.rolButtonActive : {})
              }}
              onClick={() => setRol('recepcionista')}
            >
              📋 Recepcionista
            </button>
          </div>

          {/* Campos comunes */}
          <input
            style={styles.input}
            type="text"
            name="nombre"
            placeholder="Nombre completo *"
            value={formData.nombre}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Contraseña (mínimo 6 caracteres) *"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            type="password"
            name="confirmPassword"
            placeholder="Confirmar contraseña *"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            type="tel"
            name="telefono"
            placeholder="Teléfono *"
            value={formData.telefono}
            onChange={handleChange}
            required
          />

          {/* Campos específicos para médicos */}
          {rol === 'medico' && (
            <>
              <input
                style={styles.input}
                type="text"
                name="especialidad"
                placeholder="Especialidad *"
                value={formData.especialidad}
                onChange={handleChange}
                required
              />
              <input
                style={styles.input}
                type="text"
                name="matricula"
                placeholder="Número de Matrícula *"
                value={formData.matricula}
                onChange={handleChange}
                required
              />
            </>
          )}

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Enviando solicitud...' : 'Solicitar Acceso'}
          </button>
        </form>

        <p style={styles.footer}>
          ¿Ya tienes cuenta?{' '}
          <span
            style={styles.link}
            onClick={() => navigate('/login')}
          >
            Inicia sesión aquí
          </span>
        </p>

        <div style={styles.notice}>
          ℹ️ Tu solicitud será revisada por un administrador antes de ser activada
        </div>

        <div style={styles.infoBox}>
          <p style={styles.infoTitle}>📌 Importante:</p>
          <ul style={styles.infoList}>
            <li>Solo personal médico y recepcionistas pueden registrarse</li>
            <li>Los pacientes son registrados por el personal autorizado</li>
            <li>Tu cuenta será activada tras la aprobación del administrador</li>
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
    maxWidth: '500px',
    maxHeight: '95vh',
    overflowY: 'auto',
  },
  title: {
    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
    color: '#0A4D68',
    marginBottom: '0.5rem',
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748B',
    textAlign: 'center',
    marginBottom: '2rem',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
  },
  error: {
    background: '#FEE2E2',
    color: '#DC2626',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    fontSize: 'clamp(0.875rem, 2vw, 0.95rem)',
  },
  form: {
    width: '100%',
  },
  rolSelector: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  rolButton: {
    padding: '1rem',
    border: '2px solid #E2E8F0',
    borderRadius: '0.5rem',
    background: 'white',
    cursor: 'pointer',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  rolButtonActive: {
    background: '#0A4D68',
    color: 'white',
    borderColor: '#0A4D68',
  },
  input: {
    width: '100%',
    padding: 'clamp(0.75rem, 2vw, 1rem)',
    marginBottom: '1rem',
    border: '2px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    boxSizing: 'border-box',
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
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#64748B',
    fontSize: 'clamp(0.875rem, 2vw, 0.95rem)',
  },
  link: {
    color: '#0A4D68',
    fontWeight: '600',
    cursor: 'pointer',
  },
  notice: {
    marginTop: '1rem',
    padding: '0.75rem',
    background: '#F0F9FF',
    color: '#0369A1',
    borderRadius: '0.5rem',
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    textAlign: 'center',
  },
  infoBox: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#FEF3C7',
    borderRadius: '0.5rem',
    border: '1px solid #FCD34D',
  },
  infoTitle: {
    fontSize: 'clamp(0.875rem, 2vw, 0.95rem)',
    fontWeight: '600',
    color: '#92400E',
    marginBottom: '0.5rem',
  },
  infoList: {
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    color: '#92400E',
    paddingLeft: '1.25rem',
    margin: 0,
    lineHeight: '1.8',
  },
};

export default Register;