import { useState, useEffect } from 'react';
import { citasAPI, pacientesAPI, medicosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Can from '../components/Can';

const Citas = () => {
  const { isMedico } = useAuth();
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    pacienteId: '',
    medicoId: '',
    fecha: '',
    hora: '',
    motivo: '',
    estado: 'programada'
  });

  const handleRowHover = (e) => {
    e.currentTarget.style.background = '#F8FAFC';
  };

  const handleRowLeave = (e) => {
    e.currentTarget.style.background = 'transparent';
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [citasRes, pacientesRes, medicosRes] = await Promise.all([
        citasAPI.getAll(),
        pacientesAPI.getAll(),
        medicosAPI.getAll()
      ]);
      
      // 👇 CAMBIO AQUÍ: Extraer arrays correctamente
      const citasData = citasRes.data?.data || citasRes.data || [];
      const pacientesData = pacientesRes.data?.data || pacientesRes.data || [];
      const medicosData = medicosRes.data?.data || medicosRes.data || [];
      
      setCitas(citasData);
      setPacientes(pacientesData);
      setMedicos(medicosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        // Si es médico, solo enviar el estado
        const dataToSend = isMedico() 
          ? { estado: formData.estado }
          : formData;
        
        await citasAPI.update(editando, dataToSend);
        alert('Cita actualizada correctamente');
      } else {
        await citasAPI.create(formData);
        alert('Cita creada correctamente');
      }
      setShowModal(false);
      resetForm();
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar cita');
    }
  };

  const handleEdit = (cita) => {
    setEditando(cita.id);
    setFormData({
      pacienteId: cita.pacienteId,
      medicoId: cita.medicoId,
      fecha: cita.fecha,
      hora: cita.hora,
      motivo: cita.motivo || '',
      estado: cita.estado
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta cita?')) return;
    try {
      await citasAPI.delete(id);
      alert('Cita eliminada correctamente');
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar cita');
    }
  };

  const resetForm = () => {
    setFormData({
      pacienteId: '',
      medicoId: '',
      fecha: '',
      hora: '',
      motivo: '',
      estado: 'programada'
    });
    setEditando(null);
  };

  const getNombrePaciente = (id) => {
    const p = pacientes.find(p => p.id === id);
    return p ? p.nombre : 'Desconocido';
  };

  const getNombreMedico = (id) => {
    const m = medicos.find(m => m.id === id);
    return m ? m.nombre : 'Desconocido';
  };

  const getBadgeColor = (estado) => {
    const colors = {
      programada: '#3B82F6',
      completada: '#10B981',
      cancelada: '#EF4444',
      en_proceso: '#F59E0B'
    };
    return colors[estado] || '#64748B';
  };

  return (
    <div style={styles.layout}>
      <Navbar />
      <main style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            {isMedico() ? 'Mis Citas' : 'Gestión de Citas'}
          </h1>
          
          {/* Solo Admin y Recepcionista pueden crear citas */}
          <Can roles={['administrador', 'recepcionista']}>
            <button style={styles.btnPrimary} onClick={() => { resetForm(); setShowModal(true); }}>
              + Nueva Cita
            </button>
          </Can>
        </div>

        {loading ? (
          <div style={styles.loading}>Cargando citas...</div>
        ) : (
          <div style={styles.tableWrapper}>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Paciente</th>
                    <th style={styles.th}>Médico</th>
                    <th style={styles.th}>Fecha</th>
                    <th style={styles.th}>Hora</th>
                    <th style={styles.th}>Motivo</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.empty}>No hay citas registradas</td>
                    </tr>
                  ) : (
                    citas.map(c => (
                      <tr 
                        key={c.id} 
                        style={styles.tr}
                        onMouseEnter={handleRowHover}
                        onMouseLeave={handleRowLeave}
                      >
                        <td style={styles.td}>{getNombrePaciente(c.pacienteId)}</td>
                        <td style={styles.td}>{getNombreMedico(c.medicoId)}</td>
                        <td style={styles.td}>{c.fecha}</td>
                        <td style={styles.td}>{c.hora}</td>
                        <td style={styles.td}>{c.motivo || '-'}</td>
                        <td style={styles.td}>
                          <span style={{...styles.badge, background: getBadgeColor(c.estado)}}>
                            {c.estado}
                          </span>
                        </td>
                        <td style={styles.tdActions}>
                          {/* Admin, Recepcionista y Médico pueden editar */}
                          <Can roles={['administrador', 'recepcionista', 'medico']}>
                            <button style={styles.btnEdit} onClick={() => handleEdit(c)}>
                              {isMedico() ? 'Estado' : 'Editar'}
                            </button>
                          </Can>
                          
                          {/* Solo Admin puede eliminar */}
                          <Can roles={['administrador']}>
                            <button style={styles.btnDelete} onClick={() => handleDelete(c.id)}>
                              Eliminar
                            </button>
                          </Can>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showModal && (
          <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.modalTitle}>
                {isMedico() 
                  ? 'Actualizar Estado de Cita' 
                  : `${editando ? 'Editar' : 'Nueva'} Cita`
                }
              </h2>
              <form onSubmit={handleSubmit} style={styles.form}>
                
                {/* Solo mostrar estos campos si NO es médico */}
                {!isMedico() && (
                  <>
                    <select
                      style={styles.input}
                      value={formData.pacienteId}
                      onChange={(e) => setFormData({...formData, pacienteId: e.target.value})}
                      required
                    >
                      <option value="">Seleccione un paciente</option>
                      {pacientes.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} - {p.dni}</option>
                      ))}
                    </select>

                    <select
                      style={styles.input}
                      value={formData.medicoId}
                      onChange={(e) => setFormData({...formData, medicoId: e.target.value})}
                      required
                    >
                      <option value="">Seleccione un médico</option>
                      {medicos.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre} - {m.especialidad}</option>
                      ))}
                    </select>

                    <input
                      style={styles.input}
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                      required
                    />

                    <input
                      style={styles.input}
                      type="time"
                      value={formData.hora}
                      onChange={(e) => setFormData({...formData, hora: e.target.value})}
                      required
                    />

                    <input
                      style={styles.input}
                      placeholder="Motivo de la consulta (opcional)"
                      value={formData.motivo}
                      onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                    />
                  </>
                )}

                {/* Información de la cita para médicos */}
                {isMedico() && editando && (
                  <div style={styles.citaInfo}>
                    <div style={styles.infoRow}>
                      <strong>Paciente:</strong> {getNombrePaciente(formData.pacienteId)}
                    </div>
                    <div style={styles.infoRow}>
                      <strong>Fecha:</strong> {formData.fecha}
                    </div>
                    <div style={styles.infoRow}>
                      <strong>Hora:</strong> {formData.hora}
                    </div>
                    <div style={styles.infoRow}>
                      <strong>Motivo:</strong> {formData.motivo || 'No especificado'}
                    </div>
                  </div>
                )}

                {/* Campo de estado (todos pueden verlo) */}
                <select
                  style={styles.input}
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  required
                >
                  <option value="programada">Programada</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>

                <div style={styles.modalActions}>
                  <button type="button" style={styles.btnCancel} onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" style={styles.btnSubmit}>
                    {isMedico() ? 'Actualizar Estado' : (editando ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  layout: { 
    minHeight: '100vh', 
    width: '100%',
    background: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
  },
  content: { 
    flex: 1,
    width: '100%',
    padding: 'clamp(1rem, 3vw, 2rem)',
    maxWidth: '100%',
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
    minWidth: '700px',
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
    transition: 'background 0.2s, transform 0.1s',
    cursor: 'pointer',
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
    padding: 'clamp(0.25rem, 1vw, 0.35rem) clamp(0.5rem, 2vw, 0.65rem)',
    borderRadius: '9999px',
    color: 'white',
    fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
    fontWeight: '600',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  btnEdit: {
    padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    marginRight: '0.5rem',
    cursor: 'pointer',
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    whiteSpace: 'nowrap',
  },
  btnDelete: {
    padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
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
  citaInfo: {
    background: '#F8FAFC',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  infoRow: {
    marginBottom: '0.5rem',
    color: '#64748B',
    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
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

export default Citas;