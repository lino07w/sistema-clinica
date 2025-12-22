import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import { auditAPI } from '../services/api';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';

const Auditoria = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await auditAPI.getAll();
            setLogs(response.data.data);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            addToast('Error al cargar logs de auditoría', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        switch (action.toUpperCase()) {
            case 'LOGIN': return '#088395';
            case 'CREATE': return '#22C55E';
            case 'UPDATE': return '#F59E0B';
            case 'DELETE': return '#DC2626';
            case 'REGISTER': return '#6366F1';
            default: return '#64748B';
        }
    };

    const filteredLogs = logs.filter(log =>
        log.usuarioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.detalles.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <Navbar />
            <ContentWrapper>
                <div style={styles.content}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Auditoría del Sistema</h1>
                        <p style={styles.subtitle}>Registro de acciones y eventos de seguridad</p>
                    </div>

                    <div style={styles.card}>
                        <div style={styles.filterSection}>
                            <input
                                type="text"
                                placeholder="Buscar por usuario, acción, entidad..."
                                style={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button style={styles.refreshButton} onClick={fetchLogs}>
                                Actualizar
                            </button>
                        </div>

                        {loading ? (
                            <Spinner />
                        ) : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Fecha y Hora</th>
                                            <th style={styles.th}>Usuario</th>
                                            <th style={styles.th}>Acción</th>
                                            <th style={styles.th}>Entidad</th>
                                            <th style={styles.th}>Detalles</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.length > 0 ? (
                                            filteredLogs.map(log => (
                                                <tr key={log.id} style={styles.tr}>
                                                    <td style={styles.td}>
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </td>
                                                    <td style={styles.td}>
                                                        <strong>{log.usuarioNombre}</strong>
                                                        <div style={styles.userId}>{log.usuarioId}</div>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <span style={{
                                                            ...styles.badge,
                                                            backgroundColor: getActionColor(log.accion)
                                                        }}>
                                                            {log.accion}
                                                        </span>
                                                    </td>
                                                    <td style={styles.td}>{log.entidad}</td>
                                                    <td style={styles.td}>{log.detalles}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={styles.empty}>No se encontraron registros</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </ContentWrapper>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
    },
    content: {
        padding: '2rem',
    },
    header: {
        marginBottom: '2rem',
    },
    title: {
        fontSize: '1.875rem',
        fontWeight: '700',
        color: '#0A4D68',
        margin: 0,
    },
    subtitle: {
        color: '#64748B',
        marginTop: '0.25rem',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
    },
    filterSection: {
        padding: '1.5rem',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    searchInput: {
        flex: 1,
        minWidth: '300px',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        border: '1px solid #E2E8F0',
        fontSize: '0.875rem',
    },
    refreshButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#0A4D68',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
    },
    th: {
        padding: '1rem 1.5rem',
        backgroundColor: '#F8FAFC',
        color: '#475569',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: '700',
    },
    td: {
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #E2E8F0',
        fontSize: '0.875rem',
        color: '#1E293B',
    },
    tr: {
        transition: 'background-color 0.2s',
        ':hover': {
            backgroundColor: '#F1F5F9',
        }
    },
    badge: {
        padding: '0.25rem 0.625rem',
        borderRadius: '9999px',
        color: 'white',
        fontSize: '0.75rem',
        fontWeight: '600',
    },
    userId: {
        fontSize: '0.7rem',
        color: '#94A3B8',
        marginTop: '0.2rem',
    },
    empty: {
        padding: '3rem',
        textAlign: 'center',
        color: '#94A3B8',
    }
};

export default Auditoria;
