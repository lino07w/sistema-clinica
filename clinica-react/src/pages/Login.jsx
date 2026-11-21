import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginSchema } from '../schemas/authSchema';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

/**
 * Cuentas de la demo pública. Sólo se muestran si VITE_DEMO_MODE=true
 * (configurado en Vercel), nunca en una instalación real.
 */
const DEMO_ACCOUNTS = [
  { role: 'Administrador', user: 'admin', password: 'demo1234' },
  { role: 'Médico', user: 'c.mendoza', password: 'password123' },
  { role: 'Recepción', user: 'recepcion', password: 'password123' },
];
const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const notice = location.state?.notice;

  const onSubmit = async ({ identificador, password }) => {
    setServerError('');
    try {
      await login({ usernameOrEmail: identificador, password });
      navigate('/dashboard');
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.'
      );
    }
  };

  const fillDemoAccount = ({ user, password }) => {
    setValue('identificador', user, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <AuthLayout title="Iniciar sesión" description="Accede con tu usuario o tu email.">
      {notice && !serverError && (
        <p className="auth-alert auth-alert-success" role="status">{notice}</p>
      )}
      {serverError && (
        <p className="auth-alert auth-alert-error" role="alert">{serverError}</p>
      )}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="identificador">Usuario o email</label>
          <input
            id="identificador"
            className="field-input"
            type="text"
            autoComplete="username"
            autoFocus
            aria-invalid={Boolean(errors.identificador)}
            aria-describedby={errors.identificador ? 'identificador-error' : undefined}
            {...register('identificador')}
          />
          {errors.identificador && (
            <span id="identificador-error" className="field-error">{errors.identificador.message}</span>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="password">Contraseña</label>
          <input
            id="password"
            className="field-input"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password && (
            <span id="password-error" className="field-error">{errors.password.message}</span>
          )}
        </div>

        <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="auth-switch">
        ¿Trabajas en la clínica y no tienes cuenta? <Link to="/register">Solicitar acceso</Link>
      </p>

      {isDemo && (
        <section className="demo-accounts" aria-labelledby="demo-title">
          <h2 id="demo-title">Cuentas de demostración</h2>
          <p>Los datos son ficticios. Elige un rol para completar el formulario.</p>
          <ul>
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.user}>
                <span>
                  <span className="demo-role">{account.role}</span>
                  <span className="demo-credentials">
                    {account.user} / {account.password}
                  </span>
                </span>
                <button type="button" className="btn btn-secondary" onClick={() => fillDemoAccount(account)}>
                  Usar
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AuthLayout>
  );
};

export default Login;
