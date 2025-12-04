const Loading = ({ message = 'Cargando...' }) => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.message}>{message}</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(2rem, 5vw, 3rem)',
    minHeight: '200px',
  },
  spinner: {
    width: 'clamp(40px, 8vw, 50px)',
    height: 'clamp(40px, 8vw, 50px)',
    border: '4px solid #E2E8F0',
    borderTop: '4px solid #0A4D68',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  message: {
    marginTop: '1rem',
    color: '#64748B',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
  },
};

// Agregar animación CSS al documento
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default Loading;