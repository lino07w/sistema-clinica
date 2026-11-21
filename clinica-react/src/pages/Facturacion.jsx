 import { useState, useEffect } from 'react';
import { facturasAPI, pacientesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import { Check, Plus } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatShortDate } from '../utils/dates';
import '../styles/Page.css';
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
            const [facturasRes, pacientesRes] = await Promise.all([
                facturasAPI.getAll(),
                pacientesAPI.getAll(),
            ]);

            setFacturas(facturasRes.data?.data || facturasRes.data || []);
            setPacientes(pacientesRes.data?.data || pacientesRes.data || []);
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
                addToast('Cambios guardados', 'success');
            } else {
                // CREAR NUEVA FACTURA
                await facturasAPI.create(payload);
                addToast('Factura creada', 'success');
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
            addToast('Pago registrado', 'success');
        } catch {
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
        } catch {
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
                <main className="page">
                    <div className="page-header">
                        <h1 className="page-title">Facturación</h1>
                        <button type="button" className="btn btn-primary" onClick={handleNewFactura}>
                            <Plus size={16} aria-hidden="true" />
                            Nueva factura
                        </button>
                    </div>

                    <div className="page-toolbar">
                        <SearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Buscar por paciente o concepto"
                        />
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
                                            <th>Concepto</th>
                                            <th className="cell-amount">Monto</th>
                                            <th>Estado</th>
                                            <th className="cell-actions"><span className="visually-hidden">Acciones</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredFacturas.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="table-empty">No hay facturas registradas</td>
                                            </tr>
                                        ) : (
                                            filteredFacturas.map((f) => (
                                                <tr key={f.id}>
                                                    <td className="tabular cell-nowrap">{formatShortDate(f.fecha)}</td>
                                                    <td>{f.pacienteNombre}</td>
                                                    <td>{f.concepto}</td>
                                                    <td className="tabular cell-amount">{formatCurrency(f.monto)}</td>
                                                    <td>
                                                        <StatusBadge estado={f.estado} />
                                                    </td>
                                                    <td className="cell-actions">
                                                        {f.estado === 'pendiente' && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-ghost btn-sm"
                                                                onClick={() => handleUpdateEstado(f.id, 'pagada')}
                                                            >
                                                                <Check size={14} aria-hidden="true" />
                                                                Registrar pago
                                                            </button>
                                                        )}
                                                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleEdit(f)}>
                                                            Editar
                                                        </button>
                                                        <button type="button" className="btn btn-ghost btn-sm btn-ghost-danger" onClick={() => handleDelete(f.id)}>
                                                            Eliminar
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
                        title="¿Eliminar esta factura?"
                        message="Esta acción no se puede deshacer."
                        confirmText="Eliminar factura"
                    />

                    {/* Modal - CREAR/EDITAR */}
                    {showModal && (
                        <div className="modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="modal" onClick={(e) => e.stopPropagation()}>
                                <h2 className="modal-title">
                                    {editando ? 'Editar factura' : 'Nueva factura'}
                                </h2>
                                <form onSubmit={handleSubmit(onSubmit)} className="modal-form">

                                    <div className="field">
                                        <label className="field-label">Paciente *</label>
                                        <select
                                            className="field-input" aria-invalid={Boolean(errors.pacienteId)}
                                            {...register('pacienteId')}
                                        >
                                            <option value="">Seleccione un paciente</option>
                                            {pacientes.map(p => (
                                                <option key={p.id} value={p.id}>{p.nombre} - {p.dni}</option>
                                            ))}
                                        </select>
                                        {errors.pacienteId && <span className="field-error">{errors.pacienteId.message}</span>}
                                    </div>

                                    <div className="field">
                                        <label className="field-label">Concepto *</label>
                                        <input
                                            className="field-input" aria-invalid={Boolean(errors.concepto)}
                                            type="text"
                                            placeholder="Consulta General, Análisis, etc."
                                            {...register('concepto')}
                                        />
                                        {errors.concepto && <span className="field-error">{errors.concepto.message}</span>}
                                    </div>

                                    <div className="field">
                                        <label className="field-label">Monto *</label>
                                        <input
                                            className="field-input" aria-invalid={Boolean(errors.monto)}
                                            type="number"
                                            placeholder="0.00"
                                            step="0.01"
                                            {...register('monto', { valueAsNumber: true })}
                                        />
                                        {errors.monto && <span className="field-error">{errors.monto.message}</span>}
                                    </div>

                                    <div className="field">
                                        <label className="field-label">Fecha *</label>
                                        <input
                                            className="field-input" aria-invalid={Boolean(errors.fecha)}
                                            type="date"
                                            {...register('fecha')}
                                        />
                                        {errors.fecha && <span className="field-error">{errors.fecha.message}</span>}
                                    </div>

                                    {/* 🆕 CAMPO ESTADO (solo visible al editar) */}
                                    {editando && (
                                        <div className="field">
                                            <label className="field-label">Estado</label>
                                            <select
                                                className="field-input"
                                                {...register('estado')}
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="pagada">Pagada</option>
                                                <option value="anulada">Anulada</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="modal-actions">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowModal(false);
                                                setEditando(null);
                                                reset();
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn btn-primary">
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


export default Facturacion;