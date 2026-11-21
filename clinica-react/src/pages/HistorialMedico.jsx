import { useState, useEffect } from 'react';
import { historialAPI, pacientesAPI, medicosAPI } from '../services/api';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import { Plus } from 'lucide-react';
import { formatShortDate } from '../utils/dates';
import '../styles/Page.css';
import SearchBar from '../components/SearchBar';
import ExportButtons from '../components/ExportButtons';
import Spinner from '../components/Spinner';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { historialSchema } from '../schemas/historialSchema';

// ... imports anteriores se mantienen arriba

const HistorialMedico = () => {
    const { user, isAdmin, isMedico } = useAuth();
    const { addToast } = useToast();

    const [historial, setHistorial] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [registroAEliminar, setRegistroAEliminar] = useState(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(historialSchema)
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [historialRes, pacientesRes, medicosRes] = await Promise.all([
                historialAPI.getAll(),
                pacientesAPI.getAll(),
                medicosAPI.getAll()
            ]);

            // El backend incluye las relaciones `paciente` y `medico`; se aplanan
            // los nombres para la tabla, la búsqueda y la exportación.
            const registros = historialRes.data?.data || historialRes.data || [];
            setHistorial(registros.map((r) => ({
                ...r,
                pacienteNombre: r.paciente?.nombre ?? '',
                medicoNombre: r.medico?.nombre ?? '',
            })));
            setPacientes(pacientesRes.data?.data || pacientesRes.data || []);
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

            setMedicos(loadedMedicos);
        } catch (error) {
            console.error('Error cargando datos:', error);
            addToast('Error al cargar historial médico', 'error');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (editando) {
                await historialAPI.update(editando, data);
                addToast('Cambios guardados', 'success');
            } else {
                await historialAPI.create(data);
                addToast('Registro creado', 'success');
            }
            setShowModal(false);
            reset();
            setEditando(null);
            cargarDatos();
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || 'Error al guardar registro', 'error');
        }
    };

    const handleDelete = (id) => {
        setRegistroAEliminar(id);
        setShowConfirm(true);
    };

    const confirmarEliminacion = async () => {
        try {
            await historialAPI.delete(registroAEliminar);
            addToast('Registro eliminado', 'success');
            cargarDatos();
        } catch {
            addToast('Error al eliminar registro', 'error');
        } finally {
            setShowConfirm(false);
            setRegistroAEliminar(null);
        }
    };

    const handleEdit = (registro) => {
        setEditando(registro.id);
        reset({
            pacienteId: registro.pacienteId,
            medicoId: registro.medicoId,
            fecha: registro.fecha,
            diagnostico: registro.diagnostico,
            tratamiento: registro.tratamiento,
            notas: registro.notas || ''
        });
        setShowModal(true);
    };

    const handleNuevo = () => {
        setEditando(null);

        let initialMedicoId = '';
        if (isMedico()) {
            if (user.medicoId) {
                initialMedicoId = user.medicoId;
            } else {
                // Fallback: buscar por email en la lista de médicos (por si acaba de registrarse)
                const currentMedico = medicos.find(m => m.email === user.email);
                if (currentMedico) initialMedicoId = currentMedico.id;
            }
        }

        reset({
            pacienteId: '',
            medicoId: initialMedicoId,
            fecha: new Date().toISOString().split('T')[0],
            diagnostico: '',
            tratamiento: '',
            notas: ''
        });
        setShowModal(true);
    };

    const filteredHistorial = historial.filter(h =>
        h.pacienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.diagnostico?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Navbar />
            <ContentWrapper>
                <main className="page">
                    <div className="page-header">
                        <h1 className="page-title">Historial médico</h1>
                        <button type="button" className="btn btn-primary" onClick={handleNuevo}>
                            <Plus size={16} aria-hidden="true" />
                            Nuevo registro
                        </button>
                    </div>

                    <div className="page-toolbar">
                        <SearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Buscar por paciente o diagnóstico"
                        />
                        <ExportButtons
                            data={historial}
                            fileName="Historial_Medico"
                            title="Historial Médico Completo"
                            columns={[
                                { header: 'Fecha', dataKey: 'fecha' },
                                { header: 'Paciente', dataKey: 'pacienteNombre' },
                                { header: 'Médico', dataKey: 'medicoNombre' },
                                { header: 'Diagnóstico', dataKey: 'diagnostico' },
                                { header: 'Tratamiento', dataKey: 'tratamiento' },
                            ]}
                        />
                    </div>

                    <div className="table-panel">
                        {loading ? (
                            <Spinner />
                        ) : (
                            <div className="table-scroll">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Paciente</th>
                                            <th>Médico</th>
                                            <th>Diagnóstico</th>
                                            <th>Tratamiento</th>
                                            <th className="cell-actions"><span className="visually-hidden">Acciones</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredHistorial.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="table-empty">No hay registros encontrados</td>
                                            </tr>
                                        ) : (
                                            filteredHistorial.map(record => (
                                                <tr key={record.id}>
                                                    <td className="tabular cell-nowrap">{formatShortDate(record.fecha)}</td>
                                                    <td data-label="Paciente">{record.pacienteNombre}</td>
                                                    <td data-label="Médico">{record.medicoNombre}</td>
                                                    <td data-label="Diagnóstico">{record.diagnostico}</td>
                                                    <td data-label="Tratamiento">
                                                        <div className="cell-truncate" title={record.tratamiento}>{record.tratamiento}</div>
                                                    </td>
                                                    <td className="cell-actions">
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => handleEdit(record)}
                                                        >
                                                            Editar
                                                        </button>
                                                        {isAdmin() && (
                                                            <button
                                                                className="btn btn-ghost btn-sm btn-ghost-danger"
                                                                onClick={() => handleDelete(record.id)}
                                                            >
                                                                Eliminar
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <ConfirmModal
                        isOpen={showConfirm}
                        onClose={() => setShowConfirm(false)}
                        onConfirm={confirmarEliminacion}
                        title="¿Eliminar este registro médico?"
                        message="Esta acción no se puede deshacer."
                        confirmText="Eliminar registro"
                    />

                    {showModal && (
                        <div className="modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="modal" onClick={(e) => e.stopPropagation()}>
                                <h2 className="modal-title">
                                    {editando ? 'Editar registro' : 'Nuevo registro clínico'}
                                </h2>
                                <form onSubmit={handleSubmit(onSubmit)} className="modal-form">

                                    <div className="field-row">
                                        <div className="field">
                                            <label className="field-label">Paciente</label>
                                            <select
                                                className="field-input" aria-invalid={Boolean(errors.pacienteId)}
                                                {...register('pacienteId')}
                                            >
                                                <option value="">Seleccione Paciente</option>
                                                {pacientes.map(p => (
                                                    <option key={p.id} value={p.id}>{p.nombre} - {p.dni}</option>
                                                ))}
                                            </select>
                                            {errors.pacienteId && <span className="field-error">{errors.pacienteId.message}</span>}
                                        </div>

                                        <div className="field">
                                            <label className="field-label">Médico</label>
                                            <select
                                                className="field-input" aria-invalid={Boolean(errors.medicoId)}
                                                {...register('medicoId')}
                                                disabled={isMedico()}
                                            >
                                                <option value="">Seleccione Médico</option>
                                                {medicos.map(m => (
                                                    <option key={m.id} value={m.id}>{m.nombre} - {m.especialidad}</option>
                                                ))}
                                            </select>
                                            {errors.medicoId && <span className="field-error">{errors.medicoId.message}</span>}
                                        </div>
                                    </div>

                                    <div className="field">
                                        <label className="field-label">Fecha</label>
                                        <input
                                            className="field-input" aria-invalid={Boolean(errors.fecha)}
                                            type="date"
                                            {...register('fecha')}
                                        />
                                        {errors.fecha && <span className="field-error">{errors.fecha.message}</span>}
                                    </div>

                                    <div className="field">
                                        <label className="field-label">Diagnóstico</label>
                                        <input
                                            className="field-input" aria-invalid={Boolean(errors.diagnostico)}
                                            type="text"
                                            placeholder="Ej. Hipertensión Arterial"
                                            {...register('diagnostico')}
                                        />
                                        {errors.diagnostico && <span className="field-error">{errors.diagnostico.message}</span>}
                                    </div>

                                    <div className="field">
                                        <label className="field-label">Tratamiento</label>
                                        <textarea
                                            className="field-input field-textarea" aria-invalid={Boolean(errors.tratamiento)}
                                            placeholder="Medicación, dosis e indicaciones"
                                            rows="3"
                                            {...register('tratamiento')}
                                        />
                                        {errors.tratamiento && <span className="field-error">{errors.tratamiento.message}</span>}
                                    </div>

                                    <div className="field">
                                        <label className="field-label">Notas Adicionales</label>
                                        <textarea
                                            className="field-input field-textarea"
                                            placeholder="Notas para la próxima consulta"
                                            rows="2"
                                            {...register('notas')}
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
                                            Guardar registro
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


export default HistorialMedico;
