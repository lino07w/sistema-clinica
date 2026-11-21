import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'light' ? 'Usar tema oscuro' : 'Usar tema claro';

  return (
    <button type="button" className="btn btn-ghost btn-icon" onClick={toggleTheme} aria-label={label} title={label}>
      {theme === 'light' ? <Moon size={18} strokeWidth={1.75} /> : <Sun size={18} strokeWidth={1.75} />}
    </button>
  );
};

export default ThemeToggle;
