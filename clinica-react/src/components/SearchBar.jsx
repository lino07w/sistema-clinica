import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Buscar…', label = 'Buscar' }) => (
  <div className="search">
    <Search size={16} className="search-icon" aria-hidden="true" />
    <input
      type="search"
      className="search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
    />
    {value && (
      <button type="button" className="search-clear" onClick={() => onChange('')} aria-label="Borrar búsqueda">
        <X size={14} />
      </button>
    )}
  </div>
);

export default SearchBar;
