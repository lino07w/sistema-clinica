const DateRangeFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, onClear }) => {
  return (
    <div style={styles.container}>
      <div style={styles.filterGroup}>
        <label style={styles.label}>📅 Fecha desde:</label>
        <input
          type="date"
          style={styles.input}
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
      </div>
      
      <div style={styles.filterGroup}>
        <label style={styles.label}>📅 Fecha hasta:</label>
        <input
          type="date"
          style={styles.input}
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </div>
      
      {(startDate || endDate) && (
        <button style={styles.clearBtn} onClick={onClear}>
          ✕ Limpiar filtros
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    padding: '1rem',
    background: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    marginBottom: '1.5rem',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    color: '#64748B',
    fontWeight: '500',
  },
  input: {
    padding: '0.625rem',
    border: '2px solid #E2E8F0',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    minWidth: '150px',
  },
  clearBtn: {
    padding: '0.625rem 1rem',
    background: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};

export default DateRangeFilter;