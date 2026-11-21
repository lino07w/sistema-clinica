import { useState, useEffect } from 'react';
import { usuariosAPI } from '../services/api';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import { Plus } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatShortDate } from '../utils/dates';

const ROLE_LABELS = {
  administrador: 'Administrador',
  medico: 'Médico',
  recepcionista: 'Recepción',
  paciente: 'Paciente',
};
import '../styles/Page.css';
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
        addToast('Usuario creado', 'success');
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
      addToast('Usuario eliminado', 'success');
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

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <main className="page">
          <div className="page-header">
            <h1 className="page-title">Usuarios</h1>
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <Plus size={16} aria-hidden="true" />
              Nuevo usuario
            </button>
          </div>

          <div className="page-toolbar">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por nombre, email o rol"
            />
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <>
              <div className="table-scroll">
                <div className="table-panel">
                  <table className="data-table">
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
                          label="Último acceso"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                        <th className="cell-actions"><span className="visually-hidden">Acciones</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="table-empty">
                            {searchTerm ? 'No se encontraron resultados' : 'No hay usuarios registrados'}
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((u) => (
                          <tr key={u.id}>
                            <td>{u.nombre}</td>
                            <td data-label="Email">{u.email}</td>
                            <td data-label="Rol">{ROLE_LABELS[u.rol] ?? u.rol}</td>
                            <td data-label="Estado"><StatusBadge estado={u.estado} /></td>
                            <td data-label="Último acceso">{u.ultimoAcceso ? formatShortDate(u.ultimoAcceso) : 'Nunca'}</td>
                            <td className="cell-actions">
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleEdit(u)}
                              >
                                Editar
                              </button>
                              {u.rol !== 'administrador' && (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => handleCambiarEstado(u.id, u.estado)}
                                  >
                                    {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-sm btn-ghost-danger"
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
            title="¿Eliminar este usuario?"
            message="Esta acción no se puede deshacer."
            confirmText="Eliminar usuario"
          />

          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">
                  {editando ? 'Editar usuario' : 'Nuevo usuario'}
                </h2>
                <form onSubmit={handleSubmit} className="modal-form">
                  <div className="field">
                    <label className="field-label" htmlFor="u-nombre">Nombre completo</label>
                    <input
                      id="u-nombre"
                      className="field-input"
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label className="field-label" htmlFor="u-email">Email</label>
                      <input
                        id="u-email"
                        className="field-input"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="u-telefono">Teléfono</label>
                      <input
                        id="u-telefono"
                        className="field-input"
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label className="field-label" htmlFor="u-rol">Rol</label>
                      <select
                        id="u-rol"
                        className="field-input"
                        value={formData.rol}
                        onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                        required
                      >
                        <option value="paciente">Paciente</option>
                        <option value="medico">Médico</option>
                        <option value="recepcionista">Recepción</option>
                        <option value="administrador">Administrador</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="u-password">
                        {editando ? 'Nueva contraseña' : 'Contraseña'}
                      </label>
                      <input
                        id="u-password"
                        className="field-input"
                        type="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editando}
                        aria-describedby={editando ? 'u-password-hint' : undefined}
                      />
                      {editando && (
                        <span id="u-password-hint" className="field-hint">Déjala vacía para no cambiarla.</span>
                      )}
                    </div>
                  </div>

                  {formData.rol === 'medico' && (
                    <div className="field-row">
                      <div className="field">
                        <label className="field-label" htmlFor="u-especialidad">Especialidad</label>
                        <input
                          id="u-especialidad"
                          className="field-input"
                          type="text"
                          value={formData.especialidad}
                          onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                          required
                        />
                      </div>
                      <div className="field">
                        <label className="field-label" htmlFor="u-matricula">N.º de colegiatura</label>
                        <input
                          id="u-matricula"
                          className="field-input"
                          type="text"
                          value={formData.matricula}
                          onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {formData.rol === 'paciente' && (
                    <div className="field-row">
                      <div className="field">
                        <label className="field-label" htmlFor="u-dni">DNI</label>
                        <input
                          id="u-dni"
                          className="field-input"
                          type="text"
                          inputMode="numeric"
                          value={formData.dni}
                          onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label className="field-label" htmlFor="u-genero">Género</label>
                        <select
                          id="u-genero"
                          className="field-input"
                          value={formData.genero}
                          onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                        >
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Otro">Otro</option>
                          <option value="No especificado">No especificado</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editando ? 'Guardar cambios' : 'Crear usuario'}
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


export default Usuarios;