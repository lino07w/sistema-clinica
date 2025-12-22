const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange 
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div style={styles.container}>
      <div style={styles.info}>
        Mostrando {startItem}-{endItem} de {totalItems} registros
      </div>
      
      <div style={styles.controls}>
        <div style={styles.pagination}>
          <button
            style={{...styles.pageBtn, ...styles.navBtn}}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Anterior
          </button>
          
          {getPageNumbers().map(page => (
            <button
              key={page}
              style={{
                ...styles.pageBtn,
                ...(page === currentPage ? styles.activePageBtn : {})
              }}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
          
          <button
            style={{...styles.pageBtn, ...styles.navBtn}}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente →
          </button>
        </div>
        
        <div style={styles.perPageSelector}>
          <label style={styles.label}>Mostrar:</label>
          <select
            style={styles.select}
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  info: {
    fontSize: '0.875rem',
    color: '#64748B',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  pagination: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  pageBtn: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #E2E8F0',
    background: 'white',
    color: '#475569',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s',
    minWidth: '40px',
  },
  activePageBtn: {
    background: '#0A4D68',
    color: 'white',
    borderColor: '#0A4D68',
  },
  navBtn: {
    fontWeight: '600',
  },
  perPageSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    color: '#64748B',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #E2E8F0',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
};

export default Pagination;