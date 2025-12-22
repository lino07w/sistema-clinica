import { useState, useEffect } from 'react';
import { medicosAPI } from '../services/api';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import TableHeader from '../components/TableHeader';
import { useTableData } from '../hooks/useTableData';
import Spinner from '../components/Spinner';
import ConfirmModal from '../components/ConfirmModal';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { medicoSchema } from '../schemas/medicoSchema';
import { useToast } from '../context/ToastContext';

// ... imports anteriores se mantienen arriba

const Medicos = () => {
  const { addToast } = useToast();
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [medicoAEliminar, setMedicoAEliminar] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(medicoSchema)
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
  } = useTableData(medicos, 10);

  useEffect(() => {
    cargarMedicos();
  }, []);

  const cargarMedicos = async () => {
    try {
      const response = await medicosAPI.getAll();
      const data = response.data?.data || response.data || [];
      setMedicos(data);
    } catch (error) {
      console.error('Error cargando médicos:', error);
      addToast('Error al cargar médicos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editando) {
        await medicosAPI.update(editando, data);
        addToast('Médico actualizado correctamente', 'success');
      } else {
        await medicosAPI.create(data);
        addToast('Médico creado correctamente', 'success');
      }
      setShowModal(false);
      reset();
      setEditando(null);
      cargarMedicos();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error al guardar médico', 'error');
    }
  };

  const handleEdit = (medico) => {
    setEditando(medico.id);
    reset({
      nombre: medico.nombre,
      especialidad: medico.especialidad,
      matricula: medico.matricula || '',
      telefono: medico.telefono || '',
      email: medico.email || ''
    });
    setShowModal(true);
  };

  const handleNuevo = () => {
    setEditando(null);
    reset({
      nombre: '',
      especialidad: '',
      matricula: '',
      telefono: '',
      email: ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setMedicoAEliminar(id);
    setShowConfirm(true);
  };

  const confirmarEliminacion = async () => {
    try {
      await medicosAPI.delete(medicoAEliminar);
      addToast('Médico eliminado correctamente', 'success');
      cargarMedicos();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error al eliminar médico', 'error');
    } finally {
      setShowConfirm(false);
      setMedicoAEliminar(null);
    }
  };

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <main style={styles.content}>
          <div style={styles.header}>
            <h1 style={styles.title}>Gestión de Médicos</h1>
            <button style={styles.btnPrimary} onClick={handleNuevo}>
              + Nuevo Médico
            </button>
          </div>

          {/* Barra de búsqueda */}
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre, especialidad, matrícula..."
          />

          {loading ? (
            <Spinner />
          ) : (
            <>
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
                          column="especialidad"
                          label="Especialidad"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                        <TableHeader
                          column="matricula"
                          label="Matrícula"
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
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={styles.empty}>
                            {searchTerm ? 'No se encontraron resultados' : 'No hay médicos registrados'}
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((m) => (
                          <tr key={m.id} style={styles.tr}>
                            <td style={styles.td}>{m.nombre}</td>
                            <td style={styles.td}>
                              <span style={styles.badge}>{m.especialidad}</span>
                            </td>
                            <td style={styles.td}>{m.matricula || '-'}</td>
                            <td style={styles.td}>{m.telefono || '-'}</td>
                            <td style={styles.tdActions}>
                              <button
                                style={styles.btnEdit}
                                onClick={() => handleEdit(m)}
                              >
                                Editar
                              </button>
                              <button
                                style={styles.btnDelete}
                                onClick={() => handleDelete(m.id)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paginación */}
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

          <ConfirmModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={confirmarEliminacion}
            title="Eliminar Médico"
            message="¿Está seguro de que desea eliminar este médico? Esta acción no se puede deshacer."
          />

          {/* Modal */}
          {showModal && (
            <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>
                  {editando ? 'Editar Médico' : 'Nuevo Médico'}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <input
                      style={{ ...styles.input, borderColor: errors.nombre ? '#DC2626' : '#E2E8F0' }}
                      type="text"
                      placeholder="Nombre completo *"
                      {...register('nombre')}
                    />
                    {errors.nombre && <span style={styles.errorText}>{errors.nombre.message}</span>}
                  </div>

                  <div style={styles.inputGroup}>
                    <input
                      style={{ ...styles.input, borderColor: errors.especialidad ? '#DC2626' : '#E2E8F0' }}
                      type="text"
                      placeholder="Especialidad *"
                      {...register('especialidad')}
                    />
                    {errors.especialidad && <span style={styles.errorText}>{errors.especialidad.message}</span>}
                  </div>

                  <div style={styles.inputGroup}>
                    <input
                      style={{ ...styles.input, borderColor: errors.matricula ? '#DC2626' : '#E2E8F0' }}
                      type="text"
                      placeholder="Número de Matrícula *"
                      {...register('matricula')}
                    />
                    {errors.matricula && <span style={styles.errorText}>{errors.matricula.message}</span>}
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
                      style={{ ...styles.input, borderColor: errors.email ? '#DC2626' : '#E2E8F0' }}
                      type="email"
                      placeholder="Email"
                      {...register('email')}
                    />
                    {errors.email && <span style={styles.errorText}>{errors.email.message}</span>}
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
    background: '#F8FAFC',
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
    color: '#0A4D68',
    fontWeight: '700',
    margin: 0,
  },
  btnPrimary: {
    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
    background: 'linear-gradient(135deg, #0A4D68, #088395)',
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
    color: '#64748B',
    fontSize: 'clamp(1rem, 3vw, 1.125rem)',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  tableContainer: {
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
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
    background: '#F1F5F9',
    fontWeight: '600',
    color: '#1E293B',
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderTop: '1px solid #E2E8F0',
    transition: 'background 0.2s',
  },
  td: {
    padding: 'clamp(0.75rem, 2vw, 1rem)',
    color: '#64748B',
    fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
  },
  tdActions: {
    padding: 'clamp(0.75rem, 2vw, 1rem)',
    whiteSpace: 'nowrap',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#94A3B8',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.65rem',
    borderRadius: '9999px',
    background: '#10B981',
    color: 'white',
    fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
    fontWeight: '600',
  },
  btnEdit: {
    padding: '0.4rem 1rem',
    background: '#3B82F6',
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
    background: '#EF4444',
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
    background: 'white',
    padding: 'clamp(1.5rem, 4vw, 2rem)',
    borderRadius: '1rem',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    marginBottom: '1.5rem',
    color: '#0A4D68',
    fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
    margin: '0 0 1.5rem 0',
  },
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    padding: 'clamp(0.625rem, 2vw, 0.75rem)',
    border: '2px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    boxSizing: 'border-box',
  },
  inputGroup: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  errorText: {
    color: '#DC2626',
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

export default Medicos;