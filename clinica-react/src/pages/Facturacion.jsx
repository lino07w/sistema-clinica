 import { useState, useEffect } from 'react';
import { facturasAPI, pacientesAPI, configAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import SearchBar from '../components/SearchBar';
import ExportButtons from '../components/ExportButtons';
import Spinner from '../components/Spinner';
import ConfirmModal from '../components/ConfirmModal';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { facturaSchema } from '../schemas/facturaSchema';

const Facturacion = () => {
    const { addToast } = useToast();
    const [facturas, setFacturas] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [config, setConfig] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [facturaAEliminar, setFacturaAEliminar] = useState(null);
    const [editando, setEditando] = useState(null); // 🆕 Estado para editar

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(facturaSchema)
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [facturasRes, pacientesRes, configRes] = await Promise.all([
                facturasAPI.getAll(),
                pacientesAPI.getAll(),
                configAPI.get()
            ]);

            setFacturas(facturasRes.data?.data || facturasRes.data || []);
            setPacientes(pacientesRes.data?.data || pacientesRes.data || []);
            setConfig(configRes.data?.data || configRes.data || {});
        } catch (error) {
            console.error('Error cargando datos:', error);
            addToast('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const pacienteSeleccionado = pacientes.find(p => p.id === parseInt(data.pacienteId));

            const payload = {
                ...data,
                pacienteId: parseInt(data.pacienteId),
                monto: parseFloat(data.monto),
                pacienteNombre: pacienteSeleccionado ? pacienteSeleccionado.nombre : 'Desconocido'
            };

            if (editando) {
                // 🆕 EDITAR FACTURA EXISTENTE
                await facturasAPI.update(editando, payload);
                addToast('Factura actualizada correctamente', 'success');
            } else {
                // CREAR NUEVA FACTURA
                await facturasAPI.create(payload);
                addToast('Factura creada correctamente', 'success');
            }

            setShowModal(false);
            setEditando(null);
            reset();
            cargarDatos();
        } catch (error) {
            addToast(error.response?.data?.message || 'Error al guardar factura', 'error');
        }
    };

    const handleNewFactura = () => {
        setEditando(null);
        reset({
            pacienteId: '',
            monto: '',
            concepto: '',
            fecha: new Date().toISOString().split('T')[0],
            estado: 'pendiente'
        });
        setShowModal(true);
    };

    // 🆕 FUNCIÓN PARA EDITAR
    const handleEdit = (factura) => {
        setEditando(factura.id);
        
        // Cargar los datos en el formulario
        setValue('pacienteId', factura.pacienteId);
        setValue('concepto', factura.concepto);
        setValue('monto', factura.monto);
        setValue('fecha', factura.fecha);
        setValue('estado', factura.estado);
        
        setShowModal(true);
    };

    const handleUpdateEstado = async (id, estado) => {
        try {
            await facturasAPI.update(id, { estado });
            cargarDatos();
            addToast('Estado actualizado', 'success');
        } catch (error) {
            addToast('Error al actualizar estado', 'error');
        }
    };

    const handleDelete = (id) => {
        setFacturaAEliminar(id);
        setShowConfirm(true);
    };

    const confirmarEliminacion = async () => {
        try {
            await facturasAPI.delete(facturaAEliminar);
            addToast('Factura eliminada', 'success');
            cargarDatos();
        } catch (error) {
            addToast('Error al eliminar factura', 'error');
        } finally {
            setShowConfirm(false);
            setFacturaAEliminar(null);
        }
    };

    const filteredFacturas = facturas.filter(f =>
        f.pacienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.concepto?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Navbar />
            <ContentWrapper>
                <main style={styles.content}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Facturación</h1>
                        <button
                            style={styles.btnPrimary}
                            onClick={handleNewFactura}
                        >
                            + Nueva Factura
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Buscar por paciente o concepto..."
                            />
                        </div>
                        <ExportButtons
                            data={facturas}
                            fileName="Reporte_Facturas"
                            title="Reporte de Facturación"
                            columns={[
                                { header: 'Fecha', dataKey: 'fecha' },
                                { header: 'Paciente', dataKey: 'pacienteNombre' },
                                { header: 'Concepto', dataKey: 'concepto' },
                                { header: 'Monto', dataKey: 'monto' },
                                { header: 'Estado', dataKey: 'estado' },
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
                                            <th style={styles.th}>Concepto</th>
                                            <th style={styles.th}>Monto ({config.moneda || 'S/'})</th>
                                            <th style={styles.th}>Estado</th>
                                            <th style={styles.th}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredFacturas.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={styles.empty}>No hay facturas registradas</td>
                                            </tr>
                                        ) : (
                                            filteredFacturas.map((f) => (
                                                <tr key={f.id} style={styles.tr}>
                                                    <td style={styles.td}>{f.fecha}</td>
                                                    <td style={styles.td}>{f.pacienteNombre}</td>
                                                    <td style={styles.td}>{f.concepto}</td>
                                                    <td style={{ ...styles.td, fontWeight: 'bold' }}>
                                                        {parseFloat(f.monto).toFixed(2)}
                                                    </td>
                                                    <td style={styles.td}>
                                                        <span style={{
                                                            ...styles.badge,
                                                            background: f.estado === 'pagada' ? '#10B981' :
                                                                f.estado === 'anulada' ? '#EF4444' : '#F59E0B'
                                                        }}>
                                                            {f.estado}
                                                        </span>
                                                    </td>
                                                    <td style={styles.tdActions}>
                                                        {/* 🆕 BOTÓN EDITAR */}
                                                        <button
                                                            style={styles.btnEdit}
                                                            onClick={() => handleEdit(f)}
                                                            title="Editar Factura"
                                                        >
                                                            ✏️
                                                        </button>

                                                        {f.estado === 'pendiente' && (
                                                            <button
                                                                style={styles.btnSuccess}
                                                                onClick={() => handleUpdateEstado(f.id, 'pagada')}
                                                                title="Marcar como Pagada"
                                                            >
                                                                ✓
                                                            </button>
                                                        )}
                                                        
                                                        <button
                                                            style={styles.btnDelete}
                                                            onClick={() => handleDelete(f.id)}
                                                            title="Eliminar"
                                                        >
                                                            🗑️
                                                        </button>
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
                        title="Eliminar Factura"
                        message="¿Está seguro de que desea eliminar esta factura? Esta acción no se puede deshacer."
                    />

                    {/* Modal - CREAR/EDITAR */}
                    {showModal && (
                        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
                            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                                <h2 style={styles.modalTitle}>
                                    {editando ? 'Editar Factura' : 'Nueva Factura'}
                                </h2>
                                <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Paciente *</label>
                                        <select
                                            style={{ ...styles.select, borderColor: errors.pacienteId ? '#DC2626' : 'var(--border-color)' }}
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
                                        <label style={styles.label}>Concepto *</label>
                                        <input
                                            style={{ ...styles.input, borderColor: errors.concepto ? '#DC2626' : 'var(--border-color)' }}
                                            type="text"
                                            placeholder="Consulta General, Análisis, etc."
                                            {...register('concepto')}
                                        />
                                        {errors.concepto && <span style={styles.errorText}>{errors.concepto.message}</span>}
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Monto *</label>
                                        <input
                                            style={{ ...styles.input, borderColor: errors.monto ? '#DC2626' : 'var(--border-color)' }}
                                            type="number"
                                            placeholder="0.00"
                                            step="0.01"
                                            {...register('monto', { valueAsNumber: true })}
                                        />
                                        {errors.monto && <span style={styles.errorText}>{errors.monto.message}</span>}
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Fecha *</label>
                                        <input
                                            style={{ ...styles.input, borderColor: errors.fecha ? '#DC2626' : 'var(--border-color)' }}
                                            type="date"
                                            {...register('fecha')}
                                        />
                                        {errors.fecha && <span style={styles.errorText}>{errors.fecha.message}</span>}
                                    </div>

                                    {/* 🆕 CAMPO ESTADO (solo visible al editar) */}
                                    {editando && (
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Estado</label>
                                            <select
                                                style={styles.select}
                                                {...register('estado')}
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="pagada">Pagada</option>
                                                <option value="anulada">Anulada</option>
                                            </select>
                                        </div>
                                    )}

                                    <div style={styles.modalActions}>
                                        <button
                                            type="button"
                                            style={styles.btnCancel}
                                            onClick={() => {
                                                setShowModal(false);
                                                setEditando(null);
                                                reset();
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                        <button type="submit" style={styles.btnSubmit}>
                                            {editando ? 'Actualizar Factura' : 'Generar Factura'}
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
        maxWidth: '1200px',
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
        whiteSpace: 'nowrap',
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
        minWidth: '600px',
    },
    th: {
        padding: '1rem',
        textAlign: 'left',
        background: 'var(--bg-hover)',
        fontWeight: '600',
        color: 'var(--text-primary)',
        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    },
    tr: {
        borderTop: '1px solid var(--border-color)',
        transition: 'background 0.2s',
    },
    td: {
        padding: '1rem',
        color: 'var(--text-secondary)',
        fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
    },
    badge: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        color: 'white',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    tdActions: {
        padding: '1rem',
        display: 'flex',
        gap: '0.5rem',
        whiteSpace: 'nowrap',
    },
    btnEdit: {
        background: '#3B82F6',
        color: 'white',
        border: 'none',
        borderRadius: '0.25rem',
        padding: '0.25rem 0.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    btnSuccess: {
        background: 'var(--success-color)',
        color: 'white',
        border: 'none',
        borderRadius: '0.25rem',
        padding: '0.25rem 0.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    btnDelete: {
        background: 'var(--error-color)',
        color: 'white',
        border: 'none',
        borderRadius: '0.25rem',
        padding: '0.25rem 0.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    empty: {
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--text-secondary)',
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    modalTitle: {
        color: 'var(--primary-dark)',
        marginBottom: '1.5rem',
        marginTop: 0,
        fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    errorText: {
        color: 'var(--error-color)',
        fontSize: '0.85rem',
        marginTop: '0.1rem',
    },
    label: {
        fontWeight: '500',
        color: 'var(--text-primary)',
        fontSize: 'clamp(0.875rem, 2vw, 1rem)',
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

export default Facturacion;