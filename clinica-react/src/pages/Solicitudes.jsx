import { useState, useEffect } from 'react';
import { usuariosAPI } from '../services/api';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import { Check, CheckCircle2 } from 'lucide-react';
import '../styles/Page.css';
import { formatShortDate } from '../utils/dates';

const ROLE_LABELS = { medico: 'Médico', recepcionista: 'Recepción', paciente: 'Paciente' };
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

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const response = await usuariosAPI.getPendientes();
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
    try {
      await usuariosAPI.aprobar(solicitudAAprobar);
      addToast('Solicitud aprobada', 'success');
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
      addToast('Escribe el motivo del rechazo.', 'warning');
      return;
    }

    try {
      await usuariosAPI.rechazar(solicitudSeleccionada.id, motivoRechazo);
      addToast('Solicitud rechazada', 'success');
      setShowModal(false);
      setSolicitudSeleccionada(null);
      setMotivoRechazo('');
      cargarSolicitudes();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error al rechazar solicitud', 'error');
    }
  };

  const pendientes = solicitudes.length;

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <main className="page">
          <div className="page-header">
            <div>
              <h1 className="page-title">Solicitudes de acceso</h1>
              <p className="page-subtitle">
                {loading
                  ? 'Cargando…'
                  : pendientes === 0
                    ? 'No hay solicitudes por revisar.'
                    : `${pendientes} ${pendientes === 1 ? 'profesional espera' : 'profesionales esperan'} tu aprobación.`}
              </p>
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : pendientes === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={28} aria-hidden="true" />
              <p>Todas las solicitudes están revisadas. Cuando alguien pida acceso aparecerá aquí.</p>
            </div>
          ) : (
            <ul className="request-list">
              {solicitudes.map((solicitud) => (
                <li key={solicitud.id} className="request">
                  <div className="request-main">
                    <h2 className="request-name">{solicitud.nombre}</h2>
                    <p className="request-meta">
                      {ROLE_LABELS[solicitud.rol] ?? solicitud.rol}
                      {solicitud.especialidad ? `, ${solicitud.especialidad}` : ''}
                    </p>
                  </div>
                  <dl className="request-details">
                    <div>
                      <dt>Email</dt>
                      <dd>{solicitud.email}</dd>
                    </div>
                    {solicitud.telefono && (
                      <div>
                        <dt>Teléfono</dt>
                        <dd>{solicitud.telefono}</dd>
                      </div>
                    )}
                    {solicitud.matricula && (
                      <div>
                        <dt>Colegiatura</dt>
                        <dd>{solicitud.matricula}</dd>
                      </div>
                    )}
                    {solicitud.fechaCreacion && (
                      <div>
                        <dt>Solicitado</dt>
                        <dd>{formatShortDate(solicitud.fechaCreacion)}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="request-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-ghost-danger"
                      onClick={() => handleRechazarModal(solicitud)}
                    >
                      Rechazar
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => handleAprobar(solicitud.id)}>
                      <Check size={16} aria-hidden="true" />
                      Aprobar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="rechazo-title"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="rechazo-title" className="modal-title">Rechazar la solicitud de {solicitudSeleccionada?.nombre}</h2>
                <div className="field">
                  <label className="field-label" htmlFor="motivo-rechazo">Motivo</label>
                  <textarea
                    id="motivo-rechazo"
                    className="field-input field-textarea"
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    rows={4}
                    aria-describedby="motivo-hint"
                  />
                  <span id="motivo-hint" className="field-hint">
                    La persona verá este motivo al intentar iniciar sesión.
                  </span>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="button" className="btn btn-danger-solid" onClick={handleRechazar}>
                    Rechazar solicitud
                  </button>
                </div>
              </div>
            </div>
          )}

          <ConfirmModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={confirmarAprobacion}
            title="¿Aprobar esta solicitud?"
            message="La persona podrá iniciar sesión con el rol que solicitó."
            type="primary"
            confirmText="Aprobar"
          />
        </main>
      </ContentWrapper>
    </>
  );
};

export default Solicitudes;