const ReportCard = ({ title, icon, value, subtitle, color = '#0A4D68', onClick }) => {
  return (
    <div style={{...styles.card, borderLeft: `4px solid ${color}`}} onClick={onClick}>
      <div style={styles.iconContainer}>
        <span style={{...styles.icon, background: color}}>{icon}</span>
      </div>
      <div style={styles.content}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.value}>{value}</p>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  iconContainer: {
    flexShrink: 0,
  },
  icon: {
    width: '60px',
    height: '60px',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    color: '#64748B',
    fontWeight: '500',
    margin: '0 0 0.5rem 0',
  },
  value: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: '700',
    color: '#1E293B',
    margin: 0,
  },
  subtitle: {
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    color: '#94A3B8',
    margin: '0.25rem 0 0 0',
  },
};

export default ReportCard;