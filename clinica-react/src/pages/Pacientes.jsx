import { useState, useEffect } from 'react';
import { pacientesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import { Plus } from 'lucide-react';
import '../styles/Page.css';
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
        addToast('Cambios guardados', 'success');
      } else {
        await pacientesAPI.create(data);
        addToast('Paciente registrado', 'success');
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
      addToast('Paciente eliminado', 'success');
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
        <main className="page">
          <div className="page-header">
            <h1 className="page-title">Pacientes</h1>
            <button type="button" className="btn btn-primary" onClick={handleNuevo}>
              <Plus size={16} aria-hidden="true" />
              Nuevo paciente
            </button>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <>
              <div className="page-toolbar">
                <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nombre o DNI" />
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
                        <th className="cell-actions"><span className="visually-hidden">Acciones</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((paciente) => (
                          <tr key={paciente.id}>
                            <td>{paciente.nombre}</td>
                            <td>{paciente.dni}</td>
                            <td>{paciente.email}</td>
                            <td>{paciente.telefono || '-'}</td>
                            <td className="cell-actions">
                              <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(paciente)}>
                                Editar
                              </button>
                              <button className="btn btn-ghost btn-sm btn-ghost-danger" onClick={() => handleDelete(paciente.id)}>
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="table-empty">No se encontraron pacientes</td>
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
            title="¿Eliminar este paciente?"
            message="Esta acción no se puede deshacer."
            confirmText="Eliminar paciente"
          />

          {/* Modal */}
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">
                  {editando ? 'Editar paciente' : 'Nuevo paciente'}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
                  <div className="field">
                    <label className="field-label" htmlFor="nombre">Nombre completo <span aria-hidden="true">*</span></label>
                    <input
                      id="nombre"
                      className="field-input" aria-invalid={Boolean(errors.nombre)}
                      type="text"
                      {...register('nombre')}
                    />
                    {errors.nombre && <span className="field-error">{errors.nombre.message}</span>}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="dni">DNI <span aria-hidden="true">*</span></label>
                    <input
                      id="dni"
                      className="field-input" aria-invalid={Boolean(errors.dni)}
                      type="text"
                      {...register('dni')}
                    />
                    {errors.dni && <span className="field-error">{errors.dni.message}</span>}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="fechaNacimiento">Fecha de nacimiento</label>
                    <input
                      id="fechaNacimiento"
                      className="field-input"
                      type="date"
                      {...register('fechaNacimiento')}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="telefono">Teléfono</label>
                    <input
                      id="telefono"
                      className="field-input"
                      type="tel"
                      {...register('telefono')}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="email">Email</label>
                    <input
                      id="email"
                      className="field-input" aria-invalid={Boolean(errors.email)}
                      type="email"
                      {...register('email')}
                    />
                    {errors.email && <span className="field-error">{errors.email.message}</span>}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="genero">Género <span aria-hidden="true">*</span></label>
                    <select
                      id="genero"
                      className="field-input"
                      {...register('genero')}
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                      <option value="No especificado">No especificado</option>
                    </select>
                    {errors.genero && <span className="field-error">{errors.genero.message}</span>}

                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="direccion">Dirección</label>
                    <input
                      id="direccion"
                      className="field-input"
                      type="text"
                      {...register('direccion')}
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editando ? 'Guardar cambios' : 'Registrar paciente'}
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


export default Pacientes;