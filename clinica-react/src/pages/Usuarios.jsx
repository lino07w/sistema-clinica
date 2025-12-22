import { useState, useEffect } from 'react';
import axios from 'axios';
import { usuariosAPI, pacientesAPI } from '../services/api';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import TableHeader from '../components/TableHeader';
import { useTableData } from '../hooks/useTableData';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import ConfirmModal from '../components/ConfirmModal';

const Usuarios = () => {
  const { addToast } = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'paciente',
    telefono: '',
    especialidad: '',
    matricula: '',
    dni: '',
    genero: 'No especificado'
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
  } = useTableData(usuarios, 10);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await usuariosAPI.getAll();
      const data = response.data?.data || response.data || [];
      setUsuarios(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      addToast('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await usuariosAPI.update(editando, formData);
        alert('Usuario actualizado correctamente');
      } else {
        await usuariosAPI.create(formData);
        addToast('Usuario creado correctamente', 'success');
      }
      setShowModal(false);
      resetForm();
      cargarUsuarios();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error al guardar usuario', 'error');
    }
  };

  const handleEdit = (usuario) => {
    setEditando(usuario.id);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      telefono: usuario.telefono || '',
      especialidad: usuario.especialidad || '',
      matricula: usuario.matricula || '',
      dni: usuario.dni || '',
      genero: usuario.genero || 'No especificado',
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setUsuarioAEliminar(id);
    setShowConfirm(true);
  };

  const confirmarEliminacion = async () => {
    try {
      await usuariosAPI.delete(usuarioAEliminar);
      addToast('Usuario eliminado correctamente', 'success');
      cargarUsuarios();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error al eliminar usuario', 'error');
    } finally {
      setShowConfirm(false);
      setUsuarioAEliminar(null);
    }
  };

  const handleCambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    try {
      await usuariosAPI.cambiarEstado(id, nuevoEstado);
      addToast(`Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`, 'success');
      cargarUsuarios();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error al cambiar estado', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'paciente',
      telefono: '',
      especialidad: '',
      matricula: '',
      dni: '',
      genero: 'No especificado',
    });
    setEditando(null);
  };

  const getRolBadge = (rol) => {
    const badges = {
      administrador: { color: '#DC2626', label: '🔑 Admin' },
      medico: { color: '#10B981', label: '👨‍⚕️ Médico' },
      recepcionista: { color: '#3B82F6', label: '📋 Recep.' },
      paciente: { color: '#F59E0B', label: '🧑 Paciente' }
    };
    const badge = badges[rol] || badges.paciente;
    return <span style={{ ...styles.badge, background: badge.color }}>{badge.label}</span>;
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      activo: { color: '#10B981', label: '✓ Activo' },
      inactivo: { color: '#64748B', label: '○ Inactivo' },
      pendiente: { color: '#F59E0B', label: '⏳ Pendiente' },
      rechazado: { color: '#DC2626', label: '✗ Rechazado' }
    };
    const badge = badges[estado] || badges.activo;
    return <span style={{ ...styles.badge, background: badge.color }}>{badge.label}</span>;
  };

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <main style={styles.content}>
          <div style={styles.header}>
            <h1 style={styles.title}>Gestión de Usuarios</h1>
            <button
              style={styles.btnPrimary}
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              + Nuevo Usuario
            </button>
          </div>

          {/* Barra de búsqueda */}
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre, email, rol..."
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
                          column="email"
                          label="Email"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                        <TableHeader
                          column="rol"
                          label="Rol"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                        <TableHeader
                          column="estado"
                          label="Estado"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                        <TableHeader
                          column="ultimoAcceso"
                          label="Último Acceso"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                        <th style={styles.th}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={styles.empty}>
                            {searchTerm ? 'No se encontraron resultados' : 'No hay usuarios registrados'}
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((u) => (
                          <tr key={u.id} style={styles.tr}>
                            <td style={styles.td}>{u.nombre}</td>
                            <td style={styles.td}>{u.email}</td>
                            <td style={styles.td}>{getRolBadge(u.rol)}</td>
                            <td style={styles.td}>{getEstadoBadge(u.estado)}</td>
                            <td style={styles.td}>{u.ultimoAcceso || 'Nunca'}</td>
                            <td style={styles.tdActions}>
                              <button
                                style={styles.btnEdit}
                                onClick={() => handleEdit(u)}
                              >
                                Editar
                              </button>
                              {u.rol !== 'administrador' && (
                                <>
                                  <button
                                    style={{
                                      ...styles.btnToggle,
                                      background: u.estado === 'activo' ? '#F59E0B' : '#10B981'
                                    }}
                                    onClick={() => handleCambiarEstado(u.id, u.estado)}
                                  >
                                    {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                  </button>
                                  <button
                                    style={styles.btnDelete}
                                    onClick={() => handleDelete(u.id)}
                                  >
                                    Eliminar
                                  </button>
                                </>
                              )}
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
            title="Eliminar Usuario"
            message="¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer."
          />

          {showModal && (
            <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>
                  {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Nombre completo *"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />

                  <input
                    style={styles.input}
                    type="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />

                  <input
                    style={styles.input}
                    type="password"
                    placeholder={editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editando}
                  />

                  <select
                    style={styles.input}
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    required
                  >
                    <option value="paciente">Paciente</option>
                    <option value="medico">Médico</option>
                    <option value="recepcionista">Recepcionista</option>
                    <option value="administrador">Administrador</option>
                  </select>

                  <input
                    style={styles.input}
                    type="tel"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />

                  {formData.rol === 'medico' && (
                    <>
                      <input
                        style={styles.input}
                        type="text"
                        placeholder="Especialidad *"
                        value={formData.especialidad}
                        onChange={(e) =>
                          setFormData({ ...formData, especialidad: e.target.value })
                        }
                        required
                      />
                      <input
                        style={styles.input}
                        type="text"
                        placeholder="Matrícula *"
                        value={formData.matricula}
                        onChange={(e) =>
                          setFormData({ ...formData, matricula: e.target.value })
                        }
                        required
                      />
                    </>
                  )}

                  {formData.rol === 'paciente' && (
                    <>
                      <input
                        style={styles.input}
                        type="text"
                        placeholder="DNI"
                        value={formData.dni}
                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                      />
                      <label style={{ marginTop: '0.5rem', marginBottom: '0.25rem', color: '#1E293B' }}>Género *</label>
                      <select
                        style={styles.input}
                        value={formData.genero}
                        onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                        <option value="No especificado">No especificado</option>
                      </select>
                    </>
                  )}

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
    minWidth: '900px',
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
    color: 'white',
    fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
    fontWeight: '600',
    whiteSpace: 'nowrap',
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
  btnToggle: {
    padding: '0.4rem 1rem',
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
    marginBottom: '1rem',
    border: '2px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    boxSizing: 'border-box',
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

export default Usuarios;