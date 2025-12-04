const EmptyState = ({ icon = '📋', message = 'No hay datos disponibles' }) => {
  return (
    <div style={styles.container}>
      <div style={styles.icon}>{icon}</div>
      <p style={styles.message}>{message}</p>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: 'clamp(2rem, 5vw, 3rem)',
    color: '#94A3B8',
  },
  icon: {
    fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
    marginBottom: '1rem',
    opacity: 0.5,
  },
  message: {
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontWeight: '500',
  },
};

export default EmptyState;