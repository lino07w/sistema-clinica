import { useState, useEffect } from 'react';
import { citasAPI, pacientesAPI, medicosAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
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

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(citaSchema)
  });

  // Watch para condicionales si fuera necesario, o para debugging
  const watchEstado = watch('estado');

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
        const medicosData = medicosRes.data?.data || medicosRes.data || [];

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
        addToast('Cita actualizada correctamente', 'success');
      } else {
        await citasAPI.create(data);
        addToast('Cita creada correctamente', 'success');
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

  const handleNuevo = () => {
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
      fecha: '',
      hora: '',
      motivo: '',
      estado: 'programada'
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setCitaAEliminar(id);
    setShowConfirm(true);
  };

  const confirmarEliminacion = async () => {
    try {
      await citasAPI.delete(citaAEliminar);
      addToast('Cita eliminada correctamente', 'success');
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

  const getBadgeColor = (estado) => {
    const colors = {
      programada: '#3B82F6',
      completada: '#10B981',
      cancelada: '#EF4444',
      en_proceso: '#F59E0B'
    };
    return colors[estado] || '#64748B';
  };

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <main style={styles.content}>
          <div style={styles.header}>
            <h1 style={styles.title}>
              {isMedico() ? 'Mis Citas' : 'Gestión de Citas'}
            </h1>

            <Can roles={['administrador', 'recepcionista']}>
              <button style={styles.btnPrimary} onClick={handleNuevo}>
                + Nueva Cita
              </button>
            </Can>
          </div>

          {/* ... resto del JSX de búsqueda y tabla ... */}

          <Can roles={['administrador', 'recepcionista']}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar por paciente, médico, fecha..."
                />
              </div>
              <ExportButtons
                data={citas.map(c => ({
                  ...c,
                  paciente: c.pacienteNombre || getNombrePaciente(c.pacienteId),
                  medico: c.medicoNombre || getNombreMedico(c.medicoId)
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
              <div style={styles.tableWrapper}>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
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
                          <th style={styles.th}>Paciente</th>
                          <th style={styles.th}>Médico</th>
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
                        <th style={styles.th}>Motivo</th>
                        <TableHeader
                          column="estado"
                          label="Estado"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                        <th style={styles.th}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={styles.empty}>
                            {searchTerm ? 'No se encontraron resultados' : 'No hay citas registradas'}
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map(c => (
                          <tr key={c.id} style={styles.tr}>
                            {/* Usamos c.pacienteNombre si existe (populate backend) o buscamos en array */}
                            <td style={styles.td}>{c.pacienteNombre || getNombrePaciente(c.pacienteId)}</td>
                            <td style={styles.td}>{c.medicoNombre || getNombreMedico(c.medicoId)}</td>
                            <td style={styles.td}>{c.fecha}</td>
                            <td style={styles.td}>{c.hora}</td>
                            <td style={styles.td}>{c.motivo || '-'}</td>
                            <td style={styles.td}>
                              <span style={{ ...styles.badge, background: getBadgeColor(c.estado) }}>
                                {c.estado}
                              </span>
                            </td>
                            <td style={styles.tdActions}>
                              <Can roles={['administrador', 'recepcionista', 'medico']}>
                                <button style={styles.btnEdit} onClick={() => handleEdit(c)}>
                                  {isMedico() ? 'Estado' : 'Editar'}
                                </button>
                              </Can>

                              <Can roles={['administrador']}>
                                <button style={styles.btnDelete} onClick={() => handleDelete(c.id)}>
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
            <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>
                  {isMedico()
                    ? 'Actualizar Estado de Cita'
                    : `${editando ? 'Editar' : 'Nueva'} Cita`
                  }
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>

                  {!isMedico() && (
                    <>
                      <div style={styles.inputGroup}>
                        <select
                          style={{ ...styles.input, borderColor: errors.pacienteId ? '#DC2626' : 'var(--border-color)' }}
                          {...register('pacienteId')}
                        >
                          <option value="">Seleccione un paciente</option>
                          {pacientes.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre} - {p.dni}</option>
                          ))}
                        </select>
                        {errors.pacienteId && <span style={styles.errorText}>{errors.pacienteId.message}</span>}
                      </div>

                      <div style={styles.inputGroup}>
                        <select
                          style={{
                            ...styles.input,
                            borderColor: errors.medicoId ? '#DC2626' : 'var(--border-color)',
                            backgroundColor: isMedico() ? '#f3f4f6' : 'white',
                            cursor: isMedico() ? 'not-allowed' : 'pointer'
                          }}
                          {...register('medicoId')}
                          disabled={isMedico()}
                        >
                          <option value="">Seleccione un médico</option>
                          {medicos.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre} - {m.especialidad}</option>
                          ))}
                        </select>
                        {errors.medicoId && <span style={styles.errorText}>{errors.medicoId.message}</span>}
                      </div>

                      <div style={styles.inputGroup}>
                        <input
                          style={{ ...styles.input, borderColor: errors.fecha ? '#DC2626' : 'var(--border-color)' }}
                          type="date"
                          {...register('fecha')}
                        />
                        {errors.fecha && <span style={styles.errorText}>{errors.fecha.message}</span>}
                      </div>

                      <div style={styles.inputGroup}>
                        <input
                          style={{ ...styles.input, borderColor: errors.hora ? '#DC2626' : 'var(--border-color)' }}
                          type="time"
                          {...register('hora')}
                        />
                        {errors.hora && <span style={styles.errorText}>{errors.hora.message}</span>}
                      </div>

                      <div style={styles.inputGroup}>
                        <input
                          style={styles.input}
                          placeholder="Motivo de la consulta (opcional)"
                          {...register('motivo')}
                        />
                      </div>
                    </>
                  )}

                  {isMedico() && citaEditandoData && (
                    <div style={styles.citaInfo}>
                      <div style={styles.infoRow}>
                        <strong>Paciente:</strong> {citaEditandoData.pacienteNombre}
                      </div>
                      <div style={styles.infoRow}>
                        <strong>Fecha:</strong> {citaEditandoData.fecha}
                      </div>
                      <div style={styles.infoRow}>
                        <strong>Hora:</strong> {citaEditandoData.hora}
                      </div>
                      <div style={styles.infoRow}>
                        <strong>Motivo:</strong> {citaEditandoData.motivo || 'No especificado'}
                      </div>
                    </div>
                  )}

                  <div style={styles.inputGroup}>
                    <select
                      style={styles.input}
                      {...register('estado')}
                    >
                      <option value="programada">Programada</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>

                  <div style={styles.modalActions}>
                    <button type="button" style={styles.btnCancel} onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" style={styles.btnSubmit}>
                      {isMedico() ? 'Actualizar Estado' : (editando ? 'Actualizar' : 'Crear')}
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
            title="Eliminar Cita"
            message="¿Está seguro de que desea eliminar esta cita? Esta acción no se puede deshacer."
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
    maxWidth: '100%',
    minHeight: '100vh',
    background: 'var(--bg-main)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: 'clamp(1.5rem, 5vw, 2rem)',
    color: 'var(--primary-color)',
    fontWeight: '700',
    margin: 0,
  },
  btnPrimary: {
    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
    background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-color))',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: 'var(--text-secondary)',
    fontSize: 'clamp(1rem, 3vw, 1.125rem)',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  tableContainer: {
    background: 'var(--bg-card)',
    borderRadius: '1rem',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
    minWidth: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '700px',
  },
  th: {
    padding: 'clamp(0.75rem, 2vw, 1rem)',
    textAlign: 'left',
    background: 'var(--bg-hover)',
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderTop: '1px solid var(--border-color)',
    transition: 'background 0.2s',
  },
  td: {
    padding: 'clamp(0.75rem, 2vw, 1rem)',
    color: 'var(--text-secondary)',
    fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
  },
  tdActions: {
    padding: 'clamp(0.75rem, 2vw, 1rem)',
    whiteSpace: 'nowrap',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: 'var(--text-secondary)',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
  },
  badge: {
    display: 'inline-block',
    padding: 'clamp(0.25rem, 1vw, 0.35rem) clamp(0.5rem, 2vw, 0.65rem)',
    borderRadius: '9999px',
    color: 'white',
    fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
    fontWeight: '600',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  btnEdit: {
    padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    marginRight: '0.5rem',
    cursor: 'pointer',
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    whiteSpace: 'nowrap',
  },
  btnDelete: {
    padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
    background: 'var(--error-color)',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    whiteSpace: 'nowrap',
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
    background: 'var(--bg-card)',
    padding: 'clamp(1.5rem, 4vw, 2rem)',
    borderRadius: '1rem',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    marginBottom: '1.5rem',
    color: 'var(--primary-dark)',
    fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
    margin: '0 0 1.5rem 0',
  },
  form: {
    width: '100%',
  },
  citaInfo: {
    background: 'var(--bg-hover)',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  infoRow: {
    marginBottom: '0.5rem',
    color: 'var(--text-secondary)',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
  },
  input: {
    width: '100%',
    padding: 'clamp(0.625rem, 2vw, 0.75rem)',
    border: '2px solid var(--border-color)',
    borderRadius: '0.5rem',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    boxSizing: 'border-box',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
  },
  inputGroup: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  errorText: {
    color: 'var(--error-color)',
    fontSize: '0.85rem',
    marginTop: '0.25rem',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
    flexWrap: 'wrap',
  },
  btnCancel: {
    flex: 1,
    minWidth: '120px',
    padding: 'clamp(0.625rem, 2vw, 0.75rem)',
    background: 'var(--bg-hover)',
    color: 'var(--text-secondary)',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontWeight: '500',
  },
  btnSubmit: {
    flex: 1,
    minWidth: '120px',
    padding: 'clamp(0.625rem, 2vw, 0.75rem)',
    background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-color))',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontWeight: '600',
  },
};

export default Citas;