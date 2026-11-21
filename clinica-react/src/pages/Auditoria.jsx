import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import SearchBar from '../components/SearchBar';
import Spinner from '../components/Spinner';
import { auditAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import '../styles/Page.css';

/** Los códigos internos del backend se muestran como acciones legibles. */
const ACTION_LABELS = {
  LOGIN: 'Inicio de sesión',
  REGISTER: 'Solicitud de acceso',
  RESET_PASSWORD: 'Cambio de contraseña',
  CREATE: 'Creación',
  UPDATE: 'Edición',
  DELETE: 'Eliminación',
  APPROVE: 'Aprobación',
  REJECT: 'Rechazo',
  CHANGE_STATUS: 'Cambio de estado',
};

const ENTITY_LABELS = {
  AUTH: 'Acceso',
  USER: 'Usuario',
  PACIENTE: 'Paciente',
  MEDICO: 'Médico',
  CITA: 'Cita',
  FACTURA: 'Factura',
  HISTORIAL: 'Historial',
};

const dateTimeFormatter = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' });

const Auditoria = () => {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await auditAPI.getAll();
      setLogs(response.data?.data ?? []);
    } catch (error) {
      console.error('Error cargando auditoría:', error);
      addToast('No se pudo cargar el registro de auditoría.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return logs;
    return logs.filter((log) =>
      [log.usuarioNombre, ACTION_LABELS[log.accion] ?? log.accion, ENTITY_LABELS[log.entidad] ?? log.entidad, log.detalles]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [logs, searchTerm]);

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <main className="page">
          <div className="page-header">
            <div>
              <h1 className="page-title">Auditoría</h1>
              <p className="page-subtitle">Quién hizo qué y cuándo. Se muestran las últimas 1000 acciones.</p>
            </div>
          </div>

          <div className="page-toolbar">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por persona, acción o detalle"
            />
            <button type="button" className="btn btn-secondary" onClick={fetchLogs} disabled={loading}>
              <RefreshCw size={16} aria-hidden="true" />
              Actualizar
            </button>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Persona</th>
                    <th>Acción</th>
                    <th>Sobre</th>
                    <th>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="table-empty">
                        {searchTerm ? 'Ninguna acción coincide con la búsqueda.' : 'Todavía no hay acciones registradas.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="tabular cell-nowrap">{dateTimeFormatter.format(new Date(log.timestamp))}</td>
                        <td data-label="Persona">{log.usuarioNombre}</td>
                        <td data-label="Acción">{ACTION_LABELS[log.accion] ?? log.accion}</td>
                        <td data-label="Sobre">{ENTITY_LABELS[log.entidad] ?? log.entidad}</td>
                        <td data-label="Detalle" className="cell-soft">{log.detalles}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </ContentWrapper>
    </>
  );
};

export default Auditoria;
