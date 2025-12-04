import { useState, useEffect } from 'react';
import { medicosAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Can from '../components/Can';

const Medicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    matricula: '',
    dni: '',
    telefono: '',
    email: ''
  });

  const handleRowHover = (e) => {
    e.currentTarget.style.background = '#F8FAFC';
  };

  const handleRowLeave = (e) => {
    e.currentTarget.style.background = 'transparent';
  };

  useEffect(() => {
    cargarMedicos();
  }, []);

  const cargarMedicos = async () => {
    try {
      const response = await medicosAPI.getAll();
      setMedicos(response.data);
    } catch (error) {
      console.error('Error cargando médicos:', error);
      alert('Error al cargar médicos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await medicosAPI.update(editando, formData);
        alert('Médico actualizado correctamente');
      } else {
        await medicosAPI.create(formData);
        alert('Médico creado correctamente');
      }
      setShowModal(false);
      resetForm();
      cargarMedicos();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar médico');
    }
  };

  const handleEdit = (medico) => {
    setEditando(medico.id);
    setFormData({
      nombre: medico.nombre,
      especialidad: medico.especialidad,
      matricula: medico.matricula,
      dni: medico.dni,
      telefono: medico.telefono,
      email: medico.email
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este médico?')) return;
    try {
      await medicosAPI.delete(id);
      alert('Médico eliminado correctamente');
      cargarMedicos();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar médico');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      especialidad: '',
      matricula: '',
      dni: '',
      telefono: '',
      email: ''
    });
    setEditando(null);
  };

  return (
    <div style={styles.layout}>
      <Navbar />
      <main style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Gestión de Médicos</h1>
          
          {/* Solo Admin puede crear médicos */}
          <Can roles={['administrador']}>
            <button style={styles.btnPrimary} onClick={() => { resetForm(); setShowModal(true); }}>
              + Nuevo Médico
            </button>
          </Can>
        </div>

        {loading ? (
          <div style={styles.loading}>Cargando médicos...</div>
        ) : (
          <div style={styles.tableWrapper}>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Especialidad</th>
                    <th style={styles.th}>Matrícula</th>
                    <th style={styles.th}>DNI</th>
                    <th style={styles.th}>Teléfono</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {medicos.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={styles.empty}>No hay médicos registrados</td>
                    </tr>
                  ) : (
                    medicos.map(m => (
                      <tr 
                        key={m.id} 
                        style={styles.tr}
                        onMouseEnter={handleRowHover}
                        onMouseLeave={handleRowLeave}
                      >
                        <td style={styles.td}>{m.nombre}</td>
                        <td style={styles.td}>{m.especialidad}</td>
                        <td style={styles.td}>{m.matricula}</td>
                        <td style={styles.td}>{m.dni}</td>
                        <td style={styles.td}>{m.telefono}</td>
                        <td style={styles.tdActions}>
                          {/* Solo Admin puede editar médicos */}
                          <Can roles={['administrador']}>
                            <button style={styles.btnEdit} onClick={() => handleEdit(m)}>Editar</button>
                          </Can>
                          
                          {/* Solo Admin puede eliminar médicos */}
                          <Can roles={['administrador']}>
                            <button style={styles.btnDelete} onClick={() => handleDelete(m.id)}>Eliminar</button>
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
              <h2 style={styles.modalTitle}>{editando ? 'Editar' : 'Nuevo'} Médico</h2>
              <form onSubmit={handleSubmit} style={styles.form}>
                <input
                  style={styles.input}
                  placeholder="Nombre completo"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
                <input
                  style={styles.input}
                  placeholder="Especialidad"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                  required
                />
                <input
                  style={styles.input}
                  placeholder="Matrícula"
                  value={formData.matricula}
                  onChange={(e) => setFormData({...formData, matricula: e.target.value})}
                  required
                />
                <input
                  style={styles.input}
                  placeholder="DNI"
                  value={formData.dni}
                  onChange={(e) => setFormData({...formData, dni: e.target.value})}
                  required
                />
                <input
                  style={styles.input}
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  required
                />
                <input
                  style={styles.input}
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <div style={styles.modalActions}>
                  <button type="button" style={styles.btnCancel} onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" style={styles.btnSubmit}>
                    {editando ? 'Actualizar' : 'Crear'}
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
    minWidth: '600px',
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

export default Medicos;