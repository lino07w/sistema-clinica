import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { citasAPI, pacientesAPI, medicosAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import { Plus } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatShortDate, normalizeTime } from '../utils/dates';
import '../styles/Page.css';
import Can from '../components/Can';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import TableHeader from '../components/TableHeader';
import { useTableData } from '../hooks/useTableData';
import ExportButtons from '../components/ExportButtons';
import Spinner from '../components/Spinner';
import ConfirmModal from '../components/ConfirmModal';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { citaSchema } from '../schemas/citaSchema';

// ... imports anteriores se mantienen arriba

const Citas = () => {
  const { user, isMedico } = useAuth();
  const { addToast } = useToast();
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);

  // Guardar datos temporales para mostrar info en modo edición médico
  const [citaEditandoData, setCitaEditandoData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [citaAEliminar, setCitaAEliminar] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(citaSchema)
  });

  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    sortConfig,
    handleSort,
    paginatedData,
    totalPages,
    totalItems,
  } = useTableData(citas, 10);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      if (isMedico()) {
        const citasRes = await citasAPI.getAll();
        const citasData = citasRes.data?.data || citasRes.data || [];
        setCitas(citasData);
        setPacientes([]);
        setMedicos([]);
      } else {
        const [citasRes, pacientesRes, medicosRes] = await Promise.all([
          citasAPI.getAll(),
          pacientesAPI.getAll(),
          medicosAPI.getAll()
        ]);

        const citasData = citasRes.data?.data || citasRes.data || [];
        const pacientesData = pacientesRes.data?.data || pacientesRes.data || [];

        const loadedMedicos = medicosRes.data?.data || medicosRes.data || [];

        // Si el usuario es médico, asegurar que esté en la lista para el dropdown
        if (isMedico() && !loadedMedicos.find(m => m.id === user.medicoId || m.email === user.email)) {
          loadedMedicos.push({
            id: user.medicoId || 'temp-id',
            nombre: user.nombre,
            email: user.email,
            especialidad: user.especialidad || 'Médico'
          });
        }

        setCitas(citasData);
        setPacientes(pacientesData);
        setMedicos(loadedMedicos);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      addToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editando) {
        // Si es médico, solo enviamos el estado (aunque el schema valida todo, la API ignorará lo demás o lo sobrescribimos)
        const dataToSend = isMedico() ? { estado: data.estado } : data;

        await citasAPI.update(editando, dataToSend);
        addToast('Cambios guardados', 'success');
      } else {
        await citasAPI.create(data);
        addToast('Cita agendada', 'success');
      }
      setShowModal(false);
      reset();
      setEditando(null);
      setCitaEditandoData(null);
      cargarDatos();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error al guardar cita', 'error');
    }
  };

  const handleEdit = (cita) => {
    setEditando(cita.id);
    setCitaEditandoData(cita); // Guardar para visualización estática (médicos)

    reset({
      pacienteId: cita.pacienteId,
      medicoId: cita.medicoId,
      fecha: cita.fecha,
      hora: cita.hora,
      motivo: cita.motivo || '',
      estado: cita.estado
    });

    setShowModal(true);
  };

  /** Abre el formulario de nueva cita, opcionalmente con fecha/hora sugeridas. */
  const handleNuevo = ({ fecha = '', hora = '' } = {}) => {
    setEditando(null);
    setCitaEditandoData(null);

    let initialMedicoId = '';
    if (isMedico()) {
      if (user.medicoId) {
        initialMedicoId = user.medicoId;
      } else {
        // Fallback: buscar por email en la lista de médicos
        const currentMedico = medicos.find(m => m.email === user.email);
        if (currentMedico) initialMedicoId = currentMedico.id;
      }
    }

    reset({
      pacienteId: '',
      medicoId: initialMedicoId,
      fecha,
      hora,
      motivo: '',
      estado: 'programada'
    });
    setShowModal(true);
  };

  // La agenda puede pedir "nueva cita" en un horario libre (ver Dashboard).
  const location = useLocation();
  const navigate = useNavigate();
  const nuevaCitaSugerida = location.state?.nuevaCita;
  useEffect(() => {
    if (loading || !nuevaCitaSugerida) return;
    handleNuevo(nuevaCitaSugerida);
    navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sólo al llegar con la sugerencia
  }, [loading, nuevaCitaSugerida]);

  const handleDelete = (id) => {
    setCitaAEliminar(id);
    setShowConfirm(true);
  };

  const confirmarEliminacion = async () => {
    try {
      await citasAPI.delete(citaAEliminar);
      addToast('Cita eliminada', 'success');
      cargarDatos();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error al eliminar cita', 'error');
    } finally {
      setShowConfirm(false);
      setCitaAEliminar(null);
    }
  };

  const getNombrePaciente = (id) => {
    if (isMedico() && citaEditandoData && citaEditandoData.pacienteId === id) {
      // Si somos médicos, la lista de pacientes está vacía, intentamos sacar el nombre de la cita si viene del backend poblado, 
      // o retornamos "Paciente ID..." si no tenemos el nombre.
      // En la implementación actual, citasAPI.getAll devuelve objetos Cita, no populados.
      // Pero el backend citasController.getAll SÍ popula `pacienteNombre`.
      return citaEditandoData.pacienteNombre || 'Desconocido';
    }
    const p = pacientes.find(p => p.id === id);
    // Fallback si viene populado en la lista general
    if (!p) {
      const cita = citas.find(c => c.pacienteId === id);
      if (cita && cita.pacienteNombre) return cita.pacienteNombre;
    }
    return p ? p.nombre : 'Desconocido';
  };

  const getNombreMedico = (id) => {
    const m = medicos.find(m => m.id === id);
    // Fallback
    if (!m) {
      const cita = citas.find(c => c.medicoId === id);
      if (cita && cita.medicoNombre) return cita.medicoNombre;
    }
    return m ? m.nombre : 'Desconocido';
  };

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <main className="page">
          <div className="page-header">
            <h1 className="page-title">
              {isMedico() ? 'Mis citas' : 'Citas'}
            </h1>

            <Can roles={['administrador', 'recepcionista']}>
              <button type="button" className="btn btn-primary" onClick={() => handleNuevo()}>
                <Plus size={16} aria-hidden="true" />
                Nueva cita
              </button>
            </Can>
          </div>

          {/* ... resto del JSX de búsqueda y tabla ... */}

          <Can roles={['administrador', 'recepcionista']}>
            <div className="page-toolbar">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por paciente, médico o fecha"
              />
              <ExportButtons
                data={citas.map((c) => ({
                  ...c,
                  paciente: c.paciente?.nombre || getNombrePaciente(c.pacienteId),
                  medico: c.medico?.nombre || getNombreMedico(c.medicoId),
                }))}
                fileName="Reporte_Citas"
                title="Reporte de Citas"
                columns={[
                  { header: 'Fecha', dataKey: 'fecha' },
                  { header: 'Hora', dataKey: 'hora' },
                  { header: 'Paciente', dataKey: 'paciente' },
                  { header: 'Médico', dataKey: 'medico' },
                  { header: 'Estado', dataKey: 'estado' },
                  { header: 'Motivo', dataKey: 'motivo' },
                ]}
              />
            </div>
          </Can>

          {loading ? (
            <Spinner />
          ) : (
            <>
              <div className="table-scroll">
                <div className="table-panel">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <Can roles={['administrador', 'recepcionista']}>
                          <TableHeader
                            column="pacienteId" // Ordenar por ID es raro, pero funcional
                            label="Paciente"
                            sortConfig={sortConfig}
                            onSort={handleSort}
                          />
                          <TableHeader
                            column="medicoId"
                            label="Médico"
                            sortConfig={sortConfig}
                            onSort={handleSort}
                          />
                        </Can>
                        <Can roles={['medico']}>
                          <th>Paciente</th>
                          <th>Médico</th>
                        </Can>
                        <TableHeader
                          column="fecha"
                          label="Fecha"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                        <TableHeader
                          column="hora"
                          label="Hora"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                        <th>Motivo</th>
                        <TableHeader
                          column="estado"
                          label="Estado"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                        <th className="cell-actions"><span className="visually-hidden">Acciones</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="table-empty">
                            {searchTerm ? 'No se encontraron resultados' : 'No hay citas registradas'}
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map(c => (
                          <tr key={c.id}>
                            <td>{c.paciente?.nombre || getNombrePaciente(c.pacienteId)}</td>
                            <td data-label="Médico">{c.medico?.nombre || getNombreMedico(c.medicoId)}</td>
                            <td className="tabular cell-nowrap" data-label="Fecha">{formatShortDate(c.fecha)}</td>
                            <td className="tabular" data-label="Hora">{normalizeTime(c.hora)}</td>
                            <td data-label="Motivo">{c.motivo || '-'}</td>
                            <td data-label="Estado">
                              <StatusBadge estado={c.estado} />
                            </td>
                            <td className="cell-actions">
                              <Can roles={['administrador', 'recepcionista', 'medico']}>
                                <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(c)}>
                                  {isMedico() ? 'Estado' : 'Editar'}
                                </button>
                              </Can>

                              <Can roles={['administrador']}>
                                <button className="btn btn-ghost btn-sm btn-ghost-danger" onClick={() => handleDelete(c.id)}>
                                  Eliminar
                                </button>
                              </Can>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalItems > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              )}
            </>
          )}

          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">
                  {isMedico() ? 'Estado de la cita' : editando ? 'Editar cita' : 'Nueva cita'}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
                  {!isMedico() && (
                    <>
                      <div className="field">
                        <label className="field-label" htmlFor="c-paciente">Paciente</label>
                        <select
                          id="c-paciente"
                          className="field-input"
                          aria-invalid={Boolean(errors.pacienteId)}
                          {...register('pacienteId')}
                        >
                          <option value="">Elige un paciente</option>
                          {pacientes.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre} (DNI {p.dni})</option>
                          ))}
                        </select>
                        {errors.pacienteId && <span className="field-error">{errors.pacienteId.message}</span>}
                      </div>

                      <div className="field">
                        <label className="field-label" htmlFor="c-medico">Médico</label>
                        <select
                          id="c-medico"
                          className="field-input"
                          aria-invalid={Boolean(errors.medicoId)}
                          {...register('medicoId')}
                        >
                          <option value="">Elige un médico</option>
                          {medicos.map((m) => (
                            <option key={m.id} value={m.id}>{m.nombre}, {m.especialidad}</option>
                          ))}
                        </select>
                        {errors.medicoId && <span className="field-error">{errors.medicoId.message}</span>}
                      </div>

                      <div className="field-row">
                        <div className="field">
                          <label className="field-label" htmlFor="c-fecha">Fecha</label>
                          <input
                            id="c-fecha"
                            className="field-input"
                            type="date"
                            aria-invalid={Boolean(errors.fecha)}
                            {...register('fecha')}
                          />
                          {errors.fecha && <span className="field-error">{errors.fecha.message}</span>}
                        </div>
                        <div className="field">
                          <label className="field-label" htmlFor="c-hora">Hora</label>
                          <input
                            id="c-hora"
                            className="field-input"
                            type="time"
                            aria-invalid={Boolean(errors.hora)}
                            {...register('hora')}
                          />
                          {errors.hora && <span className="field-error">{errors.hora.message}</span>}
                        </div>
                      </div>

                      <div className="field">
                        <label className="field-label" htmlFor="c-motivo">
                          Motivo <span className="field-optional">(opcional)</span>
                        </label>
                        <input id="c-motivo" className="field-input" {...register('motivo')} />
                      </div>
                    </>
                  )}

                  {isMedico() && citaEditandoData && (
                    <dl className="detail-list">
                      <div>
                        <dt>Paciente</dt>
                        <dd>{citaEditandoData.paciente?.nombre ?? getNombrePaciente(citaEditandoData.pacienteId)}</dd>
                      </div>
                      <div>
                        <dt>Fecha y hora</dt>
                        <dd>
                          {formatShortDate(citaEditandoData.fecha)}, {normalizeTime(citaEditandoData.hora)}
                        </dd>
                      </div>
                      <div>
                        <dt>Motivo</dt>
                        <dd>{citaEditandoData.motivo || 'Sin especificar'}</dd>
                      </div>
                    </dl>
                  )}

                  <div className="field">
                    <label className="field-label" htmlFor="c-estado">Estado</label>
                    <select id="c-estado" className="field-input" {...register('estado')}>
                      <option value="programada">Programada</option>
                      <option value="completada">Atendida</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {isMedico() ? 'Guardar estado' : (editando ? 'Guardar cambios' : 'Agendar cita')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <ConfirmModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={confirmarEliminacion}
            title="¿Eliminar esta cita?"
            message="Esta acción no se puede deshacer."
            confirmText="Eliminar cita"
          />
        </main>
      </ContentWrapper>
    </>
  );
};


export default Citas;