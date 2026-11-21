import { useState, useEffect } from 'react';
import { medicosAPI } from '../services/api';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import { Plus } from 'lucide-react';
import '../styles/Page.css';
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
        addToast('Cambios guardados', 'success');
      } else {
        await medicosAPI.create(data);
        addToast('Médico registrado', 'success');
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
      addToast('Médico eliminado', 'success');
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
        <main className="page">
          <div className="page-header">
            <h1 className="page-title">Médicos</h1>
            <button type="button" className="btn btn-primary" onClick={handleNuevo}>
              <Plus size={16} aria-hidden="true" />
              Nuevo médico
            </button>
          </div>

          <div className="page-toolbar">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por nombre, especialidad o matrícula"
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
                        <th className="cell-actions"><span className="visually-hidden">Acciones</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="table-empty">
                            {searchTerm ? 'No se encontraron resultados' : 'No hay médicos registrados'}
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((m) => (
                          <tr key={m.id}>
                            <td>{m.nombre}</td>
                            <td data-label="Especialidad">
                              {m.especialidad}
                            </td>
                            <td data-label="Matrícula">{m.matricula || '-'}</td>
                            <td data-label="Teléfono">{m.telefono || '-'}</td>
                            <td className="cell-actions">
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleEdit(m)}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-ghost btn-sm btn-ghost-danger"
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
            title="¿Eliminar este médico?"
            message="Esta acción no se puede deshacer."
            confirmText="Eliminar médico"
          />

          {/* Modal */}
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">
                  {editando ? 'Editar médico' : 'Nuevo médico'}
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
                    <label className="field-label" htmlFor="especialidad">Especialidad <span aria-hidden="true">*</span></label>
                    <input
                      id="especialidad"
                      className="field-input" aria-invalid={Boolean(errors.especialidad)}
                      type="text"
                      {...register('especialidad')}
                    />
                    {errors.especialidad && <span className="field-error">{errors.especialidad.message}</span>}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="matricula">Número de matrícula <span aria-hidden="true">*</span></label>
                    <input
                      id="matricula"
                      className="field-input" aria-invalid={Boolean(errors.matricula)}
                      type="text"
                      {...register('matricula')}
                    />
                    {errors.matricula && <span className="field-error">{errors.matricula.message}</span>}
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

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editando ? 'Guardar cambios' : 'Registrar médico'}
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


export default Medicos;