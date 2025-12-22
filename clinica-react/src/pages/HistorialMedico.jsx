import { useState, useEffect } from 'react';
import { historialAPI, pacientesAPI, medicosAPI } from '../services/api';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
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

            setHistorial(historialRes.data?.data || historialRes.data || []);
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
                addToast('Registro actualizado correctamente', 'success');
            } else {
                await historialAPI.create(data);
                addToast('Registro creado correctamente', 'success');
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
            addToast('Registro eliminado correctamente', 'success');
            cargarDatos();
        } catch (error) {
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
                <main style={styles.content}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Historial Médico</h1>
                        <button
                            style={styles.btnPrimary}
                            onClick={handleNuevo}
                        >
                            + Nuevo Registro
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Buscar por paciente o diagnóstico..."
                            />
                        </div>
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

                    <div style={styles.tableCard}>
                        {loading ? (
                            <Spinner />
                        ) : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Fecha</th>
                                            <th style={styles.th}>Paciente</th>
                                            <th style={styles.th}>Médico</th>
                                            <th style={styles.th}>Diagnóstico</th>
                                            <th style={styles.th}>Tratamiento</th>
                                            <th style={styles.th}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredHistorial.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={styles.empty}>No hay registros encontrados</td>
                                            </tr>
                                        ) : (
                                            filteredHistorial.map(record => (
                                                <tr key={record.id} style={styles.tr}>
                                                    <td style={styles.td}>{record.fecha}</td>
                                                    <td style={styles.td}>{record.pacienteNombre}</td>
                                                    <td style={styles.td}>{record.medicoNombre}</td>
                                                    <td style={styles.td}>{record.diagnostico}</td>
                                                    <td style={styles.td}>
                                                        <div style={styles.truncate}>{record.tratamiento}</div>
                                                    </td>
                                                    <td style={styles.tdActions}>
                                                        <button
                                                            style={styles.btnEdit}
                                                            onClick={() => handleEdit(record)}
                                                        >
                                                            Editar
                                                        </button>
                                                        {isAdmin() && (
                                                            <button
                                                                style={styles.btnDelete}
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
                        title="Eliminar Registro"
                        message="¿Está seguro de que desea eliminar este registro médico? Esta acción no se puede deshacer."
                    />

                    {showModal && (
                        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
                            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                                <h2 style={styles.modalTitle}>
                                    {editando ? 'Editar Registro' : 'Nuevo Registro Clínico'}
                                </h2>
                                <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>

                                    <div style={styles.row}>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Paciente</label>
                                            <select
                                                style={{ ...styles.select, borderColor: errors.pacienteId ? '#DC2626' : 'var(--border-color)' }}
                                                {...register('pacienteId')}
                                            >
                                                <option value="">Seleccione Paciente</option>
                                                {pacientes.map(p => (
                                                    <option key={p.id} value={p.id}>{p.nombre} - {p.dni}</option>
                                                ))}
                                            </select>
                                            {errors.pacienteId && <span style={styles.errorText}>{errors.pacienteId.message}</span>}
                                        </div>

                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Médico</label>
                                            <select
                                                style={{
                                                    ...styles.select,
                                                    borderColor: errors.medicoId ? '#DC2626' : 'var(--border-color)',
                                                    backgroundColor: isMedico() ? '#f3f4f6' : 'white',
                                                    cursor: isMedico() ? 'not-allowed' : 'pointer'
                                                }}
                                                {...register('medicoId')}
                                                disabled={isMedico()}
                                            >
                                                <option value="">Seleccione Médico</option>
                                                {medicos.map(m => (
                                                    <option key={m.id} value={m.id}>{m.nombre} - {m.especialidad}</option>
                                                ))}
                                            </select>
                                            {errors.medicoId && <span style={styles.errorText}>{errors.medicoId.message}</span>}
                                        </div>
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Fecha</label>
                                        <input
                                            style={{ ...styles.input, borderColor: errors.fecha ? '#DC2626' : 'var(--border-color)' }}
                                            type="date"
                                            {...register('fecha')}
                                        />
                                        {errors.fecha && <span style={styles.errorText}>{errors.fecha.message}</span>}
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Diagnóstico</label>
                                        <input
                                            style={{ ...styles.input, borderColor: errors.diagnostico ? '#DC2626' : 'var(--border-color)' }}
                                            type="text"
                                            placeholder="Ej. Hipertensión Arterial"
                                            {...register('diagnostico')}
                                        />
                                        {errors.diagnostico && <span style={styles.errorText}>{errors.diagnostico.message}</span>}
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Tratamiento</label>
                                        <textarea
                                            style={{ ...styles.textarea, borderColor: errors.tratamiento ? '#DC2626' : 'var(--border-color)' }}
                                            placeholder="Descripción del tratamiento..."
                                            rows="3"
                                            {...register('tratamiento')}
                                        />
                                        {errors.tratamiento && <span style={styles.errorText}>{errors.tratamiento.message}</span>}
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Notas Adicionales</label>
                                        <textarea
                                            style={styles.textarea}
                                            placeholder="Observaciones..."
                                            rows="2"
                                            {...register('notas')}
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
                                            Guardar Registro
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
        maxWidth: '1400px',
        margin: '0 auto',
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
        color: 'var(--primary-dark)',
        fontWeight: '700',
        margin: 0,
    },
    btnPrimary: {
        padding: '0.75rem 1.5rem',
        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-color))',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
    tableCard: {
        background: 'var(--bg-card)',
        borderRadius: '1rem',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        marginTop: '1.5rem',
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '800px',
    },
    th: {
        padding: '1rem',
        textAlign: 'left',
        background: 'var(--bg-hover)',
        fontWeight: '600',
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
    },
    tr: {
        borderTop: '1px solid var(--border-color)',
    },
    td: {
        padding: '1rem',
        color: 'var(--text-secondary)',
        verticalAlign: 'top',
    },
    tdActions: {
        padding: '1rem',
        display: 'flex',
        gap: '0.5rem',
    },
    btnEdit: {
        padding: '0.4rem 0.8rem',
        background: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        fontSize: '0.875rem',
    },
    btnDelete: {
        padding: '0.4rem 0.8rem',
        background: 'var(--error-color)',
        color: 'white',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        fontSize: '0.875rem',
    },
    empty: {
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--text-secondary)',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--text-secondary)',
    },
    truncate: {
        maxWidth: '200px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
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
        padding: '2rem',
        borderRadius: '1rem',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    modalTitle: {
        color: 'var(--primary-dark)',
        marginBottom: '1.5rem',
        marginTop: 0,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    row: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    inputGroup: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minWidth: '200px',
    },
    errorText: {
        color: 'var(--error-color)',
        fontSize: '0.85rem',
        marginTop: '0.1rem',
    },
    label: {
        fontWeight: '500',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
    },
    input: {
        padding: '0.75rem',
        border: '2px solid var(--border-color)',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        background: 'var(--input-bg)',
        color: 'var(--text-primary)',
    },
    select: {
        padding: '0.75rem',
        border: '2px solid var(--border-color)',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        background: 'var(--input-bg)',
        color: 'var(--text-primary)',
    },
    textarea: {
        padding: '0.75rem',
        border: '2px solid var(--border-color)',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        background: 'var(--input-bg)',
        color: 'var(--text-primary)',
        resize: 'vertical',
    },
    modalActions: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
    },
    btnCancel: {
        flex: 1,
        padding: '0.75rem',
        background: 'var(--bg-hover)',
        color: 'var(--text-secondary)',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontWeight: '600',
    },
    btnSubmit: {
        flex: 1,
        padding: '0.75rem',
        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-color))',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontWeight: '600',
    },
};

export default HistorialMedico;
