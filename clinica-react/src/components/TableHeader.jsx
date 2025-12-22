const TableHeader = ({ column, label, sortConfig, onSort }) => {
  const isSorted = sortConfig.key === column;
  const direction = isSorted ? sortConfig.direction : null;

  return (
    <th
      style={{
        ...styles.th,
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={() => onSort(column)}
    >
      <div style={styles.headerContent}>
        <span>{label}</span>
        <span style={styles.sortIcon}>
          {!isSorted && '⇅'}
          {isSorted && direction === 'asc' && '↑'}
          {isSorted && direction === 'desc' && '↓'}
        </span>
      </div>
    </th>
  );
};

const styles = {
  th: {
    padding: 'clamp(0.75rem, 2vw, 1rem)',
    textAlign: 'left',
    background: '#F1F5F9',
    fontWeight: '600',
    color: '#1E293B',
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
  },
  sortIcon: {
    fontSize: '0.875rem',
    color: '#64748B',
  },
};

export default TableHeader;