import { useState, useEffect } from 'react';
import { pacientesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import TableHeader from '../components/TableHeader';
import { useTableData } from '../hooks/useTableData';
import ExportButtons from '../components/ExportButtons';
import Spinner from '../components/Spinner';
import ConfirmModal from '../components/ConfirmModal';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pacienteSchema } from '../schemas/pacienteSchema';

// ... imports anteriores se mantienen arriba

const Pacientes = () => {
  const { addToast } = useToast();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pacienteAEliminar, setPacienteAEliminar] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(pacienteSchema)
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
  } = useTableData(pacientes, 10);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      const response = await pacientesAPI.getAll();
      const data = response.data?.data || response.data || [];
      setPacientes(data);
    } catch (error) {
      console.error('Error cargando pacientes:', error);
      addToast('Error al cargar pacientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editando) {
        await pacientesAPI.update(editando, data);
        addToast('Paciente actualizado correctamente', 'success');
      } else {
        await pacientesAPI.create(data);
        addToast('Paciente creado correctamente', 'success');
      }
      setShowModal(false);
      reset();
      setEditando(null);
      cargarPacientes();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error al guardar paciente', 'error');
    }
  };

  const handleEdit = (paciente) => {
    setEditando(paciente.id);
    reset({
      nombre: paciente.nombre,
      dni: paciente.dni,
      fechaNacimiento: paciente.fechaNacimiento || '',
      genero: paciente.genero || 'No especificado',
      telefono: paciente.telefono || '',
      direccion: paciente.direccion || '',
      email: paciente.email || ''
    });
    setShowModal(true);
  };

  const handleNuevo = () => {
    setEditando(null);
    reset({
      nombre: '',
      dni: '',
      fechaNacimiento: '',
      genero: 'No especificado',
      telefono: '',
      direccion: '',
      email: ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setPacienteAEliminar(id);
    setShowConfirm(true);
  };

  const confirmarEliminacion = async () => {
    try {
      await pacientesAPI.delete(pacienteAEliminar);
      addToast('Paciente eliminado correctamente', 'success');
      cargarPacientes();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error al eliminar paciente', 'error');
    } finally {
      setShowConfirm(false);
      setPacienteAEliminar(null);
    }
  };

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <main style={styles.content}>
          <div style={styles.header}>
            <h1 style={styles.title}>Gestión de Pacientes</h1>
            <button style={styles.btnPrimary} onClick={handleNuevo}>
              + Nuevo Paciente
            </button>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <>
              <div style={styles.filterSection}>
                <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nombre o DNI..." />
                <ExportButtons
                  data={pacientes}
                  fileName="pacientes"
                  title="Reporte de Pacientes"
                  columns={[
                    { header: 'Nombre', dataKey: 'nombre' },
                    { header: 'DNI', dataKey: 'dni' },
                    { header: 'Email', dataKey: 'email' },
                    { header: 'Teléfono', dataKey: 'telefono' },
                    { header: 'Género', dataKey: 'genero' },
                    { header: 'Dirección', dataKey: 'direccion' },
                  ]}
                />
              </div>

              <div style={styles.tableWrapper}>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <TableHeader
                          column="nombre"
                          label="Nombre"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                        <TableHeader
                          column="dni"
                          label="DNI"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                        <TableHeader
                          column="email"
                          label="Email"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                        <TableHeader
                          column="telefono"
                          label="Teléfono"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                        <th style={styles.th}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((paciente) => (
                          <tr key={paciente.id} style={styles.tr}>
                            <td style={styles.td}>{paciente.nombre}</td>
                            <td style={styles.td}>{paciente.dni}</td>
                            <td style={styles.td}>{paciente.email}</td>
                            <td style={styles.td}>{paciente.telefono || '-'}</td>
                            <td style={styles.tdActions}>
                              <button style={styles.btnEdit} onClick={() => handleEdit(paciente)}>
                                Editar
                              </button>
                              <button style={styles.btnDelete} onClick={() => handleDelete(paciente.id)}>
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={styles.empty}>No se encontraron pacientes</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                </div>
              </div>
            </>
          )}

          <ConfirmModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={confirmarEliminacion}
            title="Eliminar Paciente"
            message="¿Está seguro de que desea eliminar este paciente? Esta acción no se puede deshacer."
          />

          {/* Modal */}
          {showModal && (
            <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>
                  {editando ? 'Editar Paciente' : 'Nuevo Paciente'}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <input
                      style={{ ...styles.input, borderColor: errors.nombre ? '#DC2626' : 'var(--border-color)' }}
                      type="text"
                      placeholder="Nombre completo *"
                      {...register('nombre')}
                    />
                    {errors.nombre && <span style={styles.errorText}>{errors.nombre.message}</span>}
                  </div>

                  <div style={styles.inputGroup}>
                    <input
                      style={{ ...styles.input, borderColor: errors.dni ? '#DC2626' : 'var(--border-color)' }}
                      type="text"
                      placeholder="DNI *"
                      {...register('dni')}
                    />
                    {errors.dni && <span style={styles.errorText}>{errors.dni.message}</span>}
                  </div>

                  <div style={styles.inputGroup}>
                    <input
                      style={styles.input}
                      type="date"
                      placeholder="Fecha de Nacimiento"
                      {...register('fechaNacimiento')}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <input
                      style={styles.input}
                      type="tel"
                      placeholder="Teléfono"
                      {...register('telefono')}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <input
                      style={{ ...styles.input, borderColor: errors.email ? '#DC2626' : 'var(--border-color)' }}
                      type="email"
                      placeholder="Email"
                      {...register('email')}
                    />
                    {errors.email && <span style={styles.errorText}>{errors.email.message}</span>}
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Género *</label>
                    <select
                      style={{ ...styles.input, padding: '0.6rem' }}
                      {...register('genero')}
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                      <option value="No especificado">No especificado</option>
                    </select>
                    {errors.genero && <span style={styles.errorText}>{errors.genero.message}</span>}

                  </div>

                  <div style={styles.inputGroup}>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="Dirección"
                      {...register('direccion')}
                    />
                  </div>

                  <div style={styles.modalActions}>
                    <button
                      type="button"
                      style={styles.btnCancel}
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" style={styles.btnSubmit}>
                      {editando ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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
  filterSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
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
  btnEdit: {
    padding: '0.4rem 1rem',
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
    padding: '0.4rem 1rem',
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
    background: 'linear-gradient(135deg, #0A4D68, #088395)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    fontWeight: '600',
  },
};

export default Pacientes;