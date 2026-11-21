import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Stethoscope } from 'lucide-react';
import { authAPI } from '../services/api';
import AuthLayout from '../components/AuthLayout';

const MIN_PASSWORD = 6;

const INITIAL_FORM = {
  nombre: '',
  email: '',
  telefono: '',
  password: '',
  confirmPassword: '',
  especialidad: '',
  matricula: '',
};

const ROLES = [
  { value: 'medico', label: 'Médico', icon: Stethoscope },
  { value: 'recepcionista', label: 'Recepción', icon: ClipboardList },
];

/** Campo de formulario con etiqueta asociada. */
const Field = ({ id, label, ...inputProps }) => (
  <div className="field">
    <label className="field-label" htmlFor={id}>{label}</label>
    <input id={id} name={id} className="field-input" {...inputProps} />
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [rol, setRol] = useState('medico');
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (form.password.length < MIN_PASSWORD) {
      return `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
    }
    if (form.password !== form.confirmPassword) return 'Las contraseñas no coinciden.';
    if (rol === 'medico' && (!form.especialidad.trim() || !form.matricula.trim())) {
      return 'Indica tu especialidad y tu número de colegiatura.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const { nombre, email, password, telefono, especialidad, matricula } = form;
      await authAPI.register({
        nombre,
        email,
        password,
        telefono,
        rol,
        ...(rol === 'medico' && { especialidad, matricula }),
      });
      navigate('/login', {
        state: { notice: 'Solicitud enviada. Podrás entrar cuando un administrador la apruebe.' },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar la solicitud. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Solicitar acceso"
      description="Para personal médico y de recepción. Un administrador revisará tu solicitud antes de activarla."
    >
      {error && <p className="auth-alert auth-alert-error" role="alert">{error}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <fieldset className="field">
          <legend className="field-label">Tu rol</legend>
          <div className="segmented">
            {ROLES.map((option) => {
              const RoleIcon = option.icon;
              return (
                <span key={option.value}>
                  <input
                    type="radio"
                    id={`rol-${option.value}`}
                    name="rol"
                    value={option.value}
                    checked={rol === option.value}
                    onChange={() => setRol(option.value)}
                  />
                  <label htmlFor={`rol-${option.value}`}>
                    <RoleIcon size={16} aria-hidden="true" />
                    {option.label}
                  </label>
                </span>
              );
            })}
          </div>
        </fieldset>

        <Field id="nombre" label="Nombre completo" value={form.nombre} onChange={handleChange} autoComplete="name" required />
        <Field id="email" label="Email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required />
        <Field id="telefono" label="Teléfono" type="tel" value={form.telefono} onChange={handleChange} autoComplete="tel" required />

        {rol === 'medico' && (
          <div className="field-row">
            <Field id="especialidad" label="Especialidad" value={form.especialidad} onChange={handleChange} required />
            <Field id="matricula" label="N.º de colegiatura (CMP)" value={form.matricula} onChange={handleChange} required />
          </div>
        )}

        <div className="field-row">
          <Field
            id="password"
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={MIN_PASSWORD}
            required
          />
          <Field
            id="confirmPassword"
            label="Repite la contraseña"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
          {submitting ? 'Enviando…' : 'Enviar solicitud'}
        </button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
