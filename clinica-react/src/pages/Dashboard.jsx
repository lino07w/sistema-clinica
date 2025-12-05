import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pacientesAPI, medicosAPI, citasAPI } from '../services/api';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user, isAdmin, isMedico, isRecepcionista, isPaciente } = useAuth();
  const [stats, setStats] = useState({
    pacientes: 0,
    medicos: 0,
    citas: 0,
    citasPendientes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      // Cargar datos según el rol
      if (isAdmin() || isRecepcionista()) {
        // Admin y Recepcionista ven estadísticas completas
        const [pacientesRes, medicosRes, citasRes] = await Promise.all([
          pacientesAPI.getAll(),
          medicosAPI.getAll(),
          citasAPI.getAll()
        ]);

        // Extraer los arrays correctamente
        const pacientesData = pacientesRes.data?.data || pacientesRes.data || [];
        const medicosData = medicosRes.data?.data || medicosRes.data || [];
        const citasData = citasRes.data?.data || citasRes.data || [];

        const citasPendientes = citasData.filter(
          c => c.estado === 'programada'
        ).length;

        setStats({
          pacientes: pacientesData.length,
          medicos: medicosData.length,
          citas: citasData.length,
          citasPendientes
        });
      } else if (isMedico()) {
        // Médico solo ve sus estadísticas
        const [medicosRes, citasRes] = await Promise.all([
          medicosAPI.getAll(),
          citasAPI.getAll() // Ya viene filtrado por el backend
        ]);

        const medicosData = medicosRes.data?.data || medicosRes.data || [];
        const citasData = citasRes.data?.data || citasRes.data || [];

        const citasPendientes = citasData.filter(
          c => c.estado === 'programada'
        ).length;

        setStats({
          pacientes: 0, // Los médicos no ven esta estadística
          medicos: medicosData.length,
          citas: citasData.length,
          citasPendientes
        });
      } else if (isPaciente()) {
        // Paciente solo ve sus propias citas
        const citasRes = await citasAPI.getAll(); // Ya viene filtrado por el backend

        const citasData = citasRes.data?.data || citasRes.data || [];

        const citasPendientes = citasData.filter(
          c => c.estado === 'programada'
        ).length;

        const citasCompletadas = citasData.filter(
          c => c.estado === 'completada'
        ).length;

        setStats({
          pacientes: 0,
          medicos: 0,
          citas: citasData.length,
          citasPendientes,
          citasCompletadas
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatsCards = () => {
    if (isAdmin() || isRecepcionista()) {
      return (
        <>
          <div style={{...styles.statCard, borderLeft: '4px solid #3B82F6'}}>
            <div style={styles.statIcon}>👥</div>
            <div>
              <h3 style={styles.statValue}>{stats.pacientes}</h3>
              <p style={styles.statLabel}>Pacientes Registrados</p>
            </div>
          </div>

          <div style={{...styles.statCard, borderLeft: '4px solid #10B981'}}>
            <div style={styles.statIcon}>👨‍⚕️</div>
            <div>
              <h3 style={styles.statValue}>{stats.medicos}</h3>
              <p style={styles.statLabel}>Médicos Activos</p>
            </div>
          </div>

          <div style={{...styles.statCard, borderLeft: '4px solid #F59E0B'}}>
            <div style={styles.statIcon}>📅</div>
            <div>
              <h3 style={styles.statValue}>{stats.citas}</h3>
              <p style={styles.statLabel}>Total de Citas</p>
            </div>
          </div>

          <div style={{...styles.statCard, borderLeft: '4px solid #EF4444'}}>
            <div style={styles.statIcon}>⏰</div>
            <div>
              <h3 style={styles.statValue}>{stats.citasPendientes}</h3>
              <p style={styles.statLabel}>Citas Pendientes</p>
            </div>
          </div>
        </>
      );
    }

    if (isMedico()) {
      return (
        <>
          <div style={{...styles.statCard, borderLeft: '4px solid #F59E0B'}}>
            <div style={styles.statIcon}>📅</div>
            <div>
              <h3 style={styles.statValue}>{stats.citas}</h3>
              <p style={styles.statLabel}>Mis Citas Totales</p>
            </div>
          </div>

          <div style={{...styles.statCard, borderLeft: '4px solid #EF4444'}}>
            <div style={styles.statIcon}>⏰</div>
            <div>
              <h3 style={styles.statValue}>{stats.citasPendientes}</h3>
              <p style={styles.statLabel}>Citas Pendientes</p>
            </div>
          </div>

          <div style={{...styles.statCard, borderLeft: '4px solid #10B981'}}>
            <div style={styles.statIcon}>👨‍⚕️</div>
            <div>
              <h3 style={styles.statValue}>{stats.medicos}</h3>
              <p style={styles.statLabel}>Médicos en el Sistema</p>
            </div>
          </div>
        </>
      );
    }

    if (isPaciente()) {
      return (
        <>
          <div style={{...styles.statCard, borderLeft: '4px solid #F59E0B'}}>
            <div style={styles.statIcon}>📅</div>
            <div>
              <h3 style={styles.statValue}>{stats.citas}</h3>
              <p style={styles.statLabel}>Mis Citas Totales</p>
            </div>
          </div>

          <div style={{...styles.statCard, borderLeft: '4px solid #EF4444'}}>
            <div style={styles.statIcon}>⏰</div>
            <div>
              <h3 style={styles.statValue}>{stats.citasPendientes}</h3>
              <p style={styles.statLabel}>Citas Próximas</p>
            </div>
          </div>

          <div style={{...styles.statCard, borderLeft: '4px solid #10B981'}}>
            <div style={styles.statIcon}>✅</div>
            <div>
              <h3 style={styles.statValue}>{stats.citasCompletadas || 0}</h3>
              <p style={styles.statLabel}>Citas Completadas</p>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  const getWelcomeMessage = () => {
    if (isAdmin()) return 'Panel de Administración';
    if (isMedico()) return 'Panel del Médico';
    if (isRecepcionista()) return 'Panel de Recepción';
    if (isPaciente()) return 'Mi Panel Personal';
    return 'Dashboard';
  };

  return (
    <div style={styles.layout}>
      <Navbar />
      
      <main style={styles.content}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{getWelcomeMessage()}</h1>
            <p style={styles.subtitle}>Bienvenido/a, {user?.nombre || user?.username}</p>
          </div>
        </div>

        {loading ? (
          <div style={styles.loading}>Cargando estadísticas...</div>
        ) : (
          <div style={styles.statsGrid}>
            {renderStatsCards()}
          </div>
        )}

        {/* Información adicional según el rol */}
        <div style={styles.infoSection}>
          {isAdmin() && (
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>🔑 Acceso Completo</h3>
              <p style={styles.infoText}>
                Como administrador tienes acceso total al sistema. Puedes gestionar 
                pacientes, médicos, citas y todos los registros.
              </p>
            </div>
          )}

          {isMedico() && (
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>👨‍⚕️ Panel Médico</h3>
              <p style={styles.infoText}>
                Puedes ver y gestionar tus citas programadas. Actualiza el estado de 
                las consultas y mantén el registro de tus pacientes.
              </p>
            </div>
          )}

          {isRecepcionista() && (
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>📋 Panel de Recepción</h3>
              <p style={styles.infoText}>
                Gestiona las citas, registra nuevos pacientes y coordina las consultas 
                con los médicos disponibles.
              </p>
            </div>
          )}

          {isPaciente() && (
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>🧑 Panel Personal</h3>
              <p style={styles.infoText}>
                Consulta tus citas programadas, historial de consultas y mantén 
                actualizada tu información personal.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const styles = {
  layout: { 
    minHeight: '100vh', 
    width: '100%',
    background: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
  },
  content: { 
    flex: 1,
    width: '100%',
    padding: 'clamp(1.5rem, 3vw, 2rem)',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  header: { 
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: { 
    fontSize: 'clamp(1.5rem, 5vw, 2rem)', 
    color: '#0A4D68', 
    marginBottom: '0.5rem', 
    fontWeight: '700',
    margin: 0,
  },
  subtitle: { 
    color: '#64748B', 
    fontSize: 'clamp(0.875rem, 3vw, 1rem)',
    marginTop: '0.5rem',
  },
  loading: { 
    textAlign: 'center', 
    padding: '3rem', 
    color: '#64748B', 
    fontSize: 'clamp(1rem, 3vw, 1.125rem)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  statIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    background: 'linear-gradient(135deg, #0A4D68, #088395)',
    flexShrink: 0,
  },
  statValue: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: '0.25rem',
    margin: 0,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    fontWeight: '500',
    margin: 0,
    marginTop: '0.25rem',
  },
  infoSection: {
    marginTop: '2rem',
  },
  infoCard: {
    background: 'white',
    padding: 'clamp(1.5rem, 3vw, 2rem)',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderLeft: '4px solid #0A4D68',
  },
  infoTitle: {
    fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
    color: '#0A4D68',
    marginBottom: '0.75rem',
    fontWeight: '600',
    margin: 0,
  },
  infoText: {
    color: '#64748B',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    lineHeight: '1.6',
    margin: 0,
    marginTop: '0.75rem',
  },
};

export default Dashboard;