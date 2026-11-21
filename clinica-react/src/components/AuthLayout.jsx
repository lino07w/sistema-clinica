import { Cross } from 'lucide-react';
import '../styles/Auth.css';

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

/**
 * Estructura de las pantallas públicas (login y registro).
 * El panel izquierdo reutiliza el motivo de la agenda: las líneas horarias.
 */
const AuthLayout = ({ title, description, children }) => (
  <div className="auth">
    <aside className="auth-panel" aria-hidden="true">
      <div className="auth-brand">
        <span className="auth-brand-mark">
          <Cross size={18} strokeWidth={2.5} />
        </span>
        Clínica
      </div>
      <ol className="auth-hours">
        {HOURS.map((hour) => (
          <li key={hour} className="tabular">
            {hour}
          </li>
        ))}
      </ol>
      <p className="auth-statement">
        La agenda, los pacientes y la facturación de tu clínica, en un solo lugar.
      </p>
    </aside>

    <main className="auth-main">
      <div className="auth-form-wrap">
        <h1 className="auth-title">{title}</h1>
        {description && <p className="auth-description">{description}</p>}
        {children}
      </div>
    </main>
  </div>
);

export default AuthLayout;
