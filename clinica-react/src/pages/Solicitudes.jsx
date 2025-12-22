import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import ConfirmModal from '../components/ConfirmModal';

const Solicitudes = () => {
  const { addToast } = useToast();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [solicitudAAprobar, setSolicitudAAprobar] = useState(null);

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    try {
      const response = await axios.get(
        `${API_URL}/api/usuarios/pendientes`,
        axiosConfig
      );
      const data = response.data?.data || response.data || [];
      setSolicitudes(data);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      addToast('Error al cargar solicitudes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = (id) => {
    setSolicitudAAprobar(id);
    setShowConfirm(true);
  };

  const confirmarAprobacion = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    try {
      await axios.post(
        `${API_URL}/api/usuarios/${solicitudAAprobar}/aprobar`,
        {},
        axiosConfig
      );
      addToast('Solicitud aprobada correctamente', 'success');
      cargarSolicitudes();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error al aprobar solicitud', 'error');
    } finally {
      setShowConfirm(false);
      setSolicitudAAprobar(null);
    }
  };

  const handleRechazarModal = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setMotivoRechazo('');
    setShowModal(true);
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      addToast('Por favor ingresa un motivo de rechazo', 'warning');
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    try {
      await axios.post(
        `${API_URL}/api/usuarios/${solicitudSeleccionada.id}/rechazar`,
        { motivo: motivoRechazo },
        axiosConfig
      );
      addToast('Solicitud rechazada correctamente', 'success');
      setShowModal(false);
      setSolicitudSeleccionada(null);
      setMotivoRechazo('');
      cargarSolicitudes();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error al rechazar solicitud', 'error');
    }
  };

  const getRolBadge = (rol) => {
    const badges = {
      medico: { color: '#10B981', label: '👨‍⚕️ Médico' },
      recepcionista: { color: '#3B82F6', label: '📋 Recepcionista' },
      paciente: { color: '#F59E0B', label: '🧑 Paciente' }
    };
    const badge = badges[rol] || badges.paciente;
    return <span style={{ ...styles.badge, background: badge.color }}>{badge.label}</span>;
  };

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <main style={styles.content}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Solicitudes Pendientes</h1>
              <p style={styles.subtitle}>
                {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''} pendiente{solicitudes.length !== 1 ? 's' : ''} de aprobación
              </p>
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : solicitudes.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>✓</div>
              <h2 style={styles.emptyTitle}>No hay solicitudes pendientes</h2>
              <p style={styles.emptyText}>
                Todas las solicitudes han sido revisadas
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {solicitudes.map((solicitud) => (
                <div key={solicitud.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    {getRolBadge(solicitud.rol)}
                    <span style={styles.fecha}>{solicitud.fechaCreacion}</span>
                  </div>

                  <h3 style={styles.cardTitle}>{solicitud.nombre}</h3>
                  <p style={styles.cardEmail}>{solicitud.email}</p>

                  <div style={styles.cardInfo}>
                    {solicitud.telefono && (
                      <div style={styles.infoRow}>
                        <strong>📞 Teléfono:</strong> {solicitud.telefono}
                      </div>
                    )}
                    {solicitud.especialidad && (
                      <div style={styles.infoRow}>
                        <strong>🏥 Especialidad:</strong> {solicitud.especialidad}
                      </div>
                    )}
                    {solicitud.matricula && (
                      <div style={styles.infoRow}>
                        <strong>📋 Matrícula:</strong> {solicitud.matricula}
                      </div>
                    )}
                    {solicitud.dni && (
                      <div style={styles.infoRow}>
                        <strong>🆔 DNI:</strong> {solicitud.dni}
                      </div>
                    )}
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      style={styles.btnAprobar}
                      onClick={() => handleAprobar(solicitud.id)}
                    >
                      ✓ Aprobar
                    </button>
                    <button
                      style={styles.btnRechazar}
                      onClick={() => handleRechazarModal(solicitud)}
                    >
                      ✗ Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showModal && (
            <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>Rechazar Solicitud</h2>
                <p style={styles.modalText}>
                  Estás a punto de rechazar la solicitud de:{' '}
                  <strong>{solicitudSeleccionada?.nombre}</strong>
                </p>
                <textarea
                  style={styles.textarea}
                  placeholder="Motivo del rechazo (requerido) *"
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  rows={4}
                />
                <div style={styles.modalActions}>
                  <button
                    style={styles.btnCancel}
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button style={styles.btnSubmit} onClick={handleRechazar}>
                    Confirmar Rechazo
                  </button>
                </div>
              </div>
            </div>
          )}
          <ConfirmModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={confirmarAprobacion}
            title="Aprobar Solicitud"
            message="¿Está seguro de que desea aprobar esta solicitud de registro? El usuario podrá acceder al sistema."
            type="primary"
            confirmText="Aprobar"
          />
        </main>
      </ContentWrapper>
    </>
  );
};

const styles = {
  content: {
    flex: 1,
    width: '100%',
    padding: 'clamp(1rem, 3vw, 2rem)',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '100vh',
    background: '#F8FAFC',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: 'clamp(1.5rem, 5vw, 2rem)',
    color: '#0A4D68',
    fontWeight: '700',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    margin: 0,
  },
  loading: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#64748B',
    fontSize: 'clamp(1rem, 3vw, 1.125rem)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 1rem',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
    color: '#1E293B',
    marginBottom: '0.5rem',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    border: '2px solid #F59E0B',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  fecha: {
    fontSize: '0.75rem',
    color: '#94A3B8',
  },
  cardTitle: {
    fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
    color: '#1E293B',
    marginBottom: '0.25rem',
  },
  cardEmail: {
    color: '#64748B',
    fontSize: 'clamp(0.875rem, 2vw, 0.95rem)',
    marginBottom: '1rem',
  },
  cardInfo: {
    background: '#F8FAFC',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  infoRow: {
    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
    color: '#475569',
    marginBottom: '0.5rem',
    lineHeight: '1.5',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.65rem',
    borderRadius: '9999px',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  cardActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  btnAprobar: {
    flex: 1,
    padding: '0.625rem',
    background: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: 'clamp(0.875rem, 2vw, 0.95rem)',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnRechazar: {
    flex: 1,
    padding: '0.625rem',
    background: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: 'clamp(0.875rem, 2vw, 0.95rem)',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: 'white',
    padding: 'clamp(1.5rem, 4vw, 2rem)',
    borderRadius: '1rem',
    width: '100%',
    maxWidth: '500px',
  },
  modalTitle: {
    marginBottom: '1rem',
    color: '#0A4D68',
    fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
    margin: '0 0 1rem 0',
  },
  modalText: {
    color: '#64748B',
    marginBottom: '1rem',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  btnCancel: {
    flex: 1,
    padding: '0.75rem',
    background: '#E2E8F0',
    color: '#64748B',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontWeight: '500',
  },
  btnSubmit: {
    flex: 1,
    padding: '0.75rem',
    background: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontWeight: '600',
  },
};

export default Solicitudes;