const SearchBar = ({ value, onChange, placeholder = "Buscar..." }) => {
  return (
    <div style={styles.container}>
      <div style={styles.searchBox}>
        <span style={styles.icon}>🔍</span>
        <input
          type="text"
          style={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {value && (
          <button style={styles.clearBtn} onClick={() => onChange('')}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '1.5rem',
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    border: '2px solid #E2E8F0',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    maxWidth: '500px',
    transition: 'border-color 0.2s',
  },
  icon: {
    fontSize: '1.25rem',
    marginRight: '0.75rem',
    color: '#64748B',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    color: '#1E293B',
  },
  clearBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94A3B8',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.25rem',
    transition: 'color 0.2s',
  },
};

export default SearchBar;