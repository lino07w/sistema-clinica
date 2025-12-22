import { useState, useEffect } from 'react';
import { configAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import Spinner from '../components/Spinner';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { configSchema } from '../schemas/configSchema';

// ... imports anteriores se mantienen arriba

const Configuracion = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(configSchema)
    });

    useEffect(() => {
        cargarConfig();
    }, []);

    const cargarConfig = async () => {
        try {
            const response = await configAPI.get();
            reset(response.data?.data || {});
        } catch (error) {
            console.error('Error cargando configuración:', error);
            addToast('Error al cargar la configuración', 'error');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            await configAPI.update(data);
            addToast('Configuración actualizada correctamente', 'success');
        } catch (error) {
            console.error('Error guardando configuración:', error);
            addToast('Error al guardar la configuración', 'error');
        }
    };

    return (
        <>
            <Navbar />
            <ContentWrapper>
                <main style={styles.content}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Configuración de la Clínica</h1>
                    </div>

                    <div style={styles.card}>
                        {loading ? (
                            <Spinner />
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
                                <h2 style={styles.sectionTitle}>Información General</h2>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Nombre de la Clínica</label>
                                    <input
                                        style={{ ...styles.input, borderColor: errors.nombre ? '#DC2626' : '#E2E8F0' }}
                                        type="text"
                                        {...register('nombre')}
                                    />
                                    {errors.nombre && <span style={styles.errorText}>{errors.nombre.message}</span>}
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Dirección</label>
                                    <input
                                        style={{ ...styles.input, borderColor: errors.direccion ? '#DC2626' : '#E2E8F0' }}
                                        type="text"
                                        {...register('direccion')}
                                    />
                                    {errors.direccion && <span style={styles.errorText}>{errors.direccion.message}</span>}
                                </div>

                                <div style={styles.row}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Teléfono</label>
                                        <input
                                            style={{ ...styles.input, borderColor: errors.telefono ? '#DC2626' : '#E2E8F0' }}
                                            type="text"
                                            {...register('telefono')}
                                        />
                                        {errors.telefono && <span style={styles.errorText}>{errors.telefono.message}</span>}
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Email de Contacto</label>
                                        <input
                                            style={{ ...styles.input, borderColor: errors.email ? '#DC2626' : '#E2E8F0' }}
                                            type="email"
                                            {...register('email')}
                                        />
                                        {errors.email && <span style={styles.errorText}>{errors.email.message}</span>}
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Moneda (Símbolo)</label>
                                    <input
                                        style={{ ...styles.input, borderColor: errors.moneda ? '#DC2626' : '#E2E8F0' }}
                                        type="text"
                                        placeholder="e.g. $, €"
                                        {...register('moneda')}
                                    />
                                    {errors.moneda && <span style={styles.errorText}>{errors.moneda.message}</span>}
                                </div>

                                <button type="submit" style={styles.button}>
                                    Guardar Cambios
                                </button>
                            </form>
                        )}
                    </div>
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
        background: '#F8FAFC',
    },
    header: {
        marginBottom: '2rem',
    },
    title: {
        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
        color: '#0A4D68',
        fontWeight: '700',
        margin: 0,
    },
    card: {
        background: 'white',
        padding: 'clamp(1.5rem, 4vw, 3rem)',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
        fontSize: '1.25rem',
        color: '#475569',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: '0.5rem',
    },
    form: {
        maxWidth: '800px',
    },
    row: {
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
    },
    inputGroup: {
        marginBottom: '1.5rem',
        flex: 1,
        minWidth: '250px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    errorText: {
        color: '#DC2626',
        fontSize: '0.85rem',
        marginTop: '0.1rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        color: '#1E293B',
        fontWeight: '500',
        fontSize: '0.95rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '2px solid #E2E8F0',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    },
    button: {
        padding: '0.75rem 1.5rem',
        background: 'linear-gradient(135deg, #0A4D68, #088395)',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '1rem',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        color: '#64748B',
    },
};

export default Configuracion;
