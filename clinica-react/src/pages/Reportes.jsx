import { useState, useEffect } from 'react';
import { citasAPI, pacientesAPI, medicosAPI } from '../services/api';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import ReportCard from '../components/ReportCard';
import DateRangeFilter from '../components/DateRangeFilter';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { exportToExcel, exportToPDF, filterByDateRange, formatDate } from '../utils/exportUtils';
import { Bar, Pie } from 'react-chartjs-2';

const Reportes = () => {
  const { addToast } = useToast();
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros de fecha
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

      setCitas(citasRes.data?.data || citasRes.data || []);
      setPacientes(pacientesRes.data?.data || pacientesRes.data || []);
      setMedicos(medicosRes.data?.data || medicosRes.data || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      addToast('Error al cargar datos para reportes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar citas por rango de fechas
  const citasFiltradas = filterByDateRange(citas, 'fecha', startDate, endDate);

  // Estadísticas generales
  const totalCitas = citasFiltradas.length;
  const citasProgramadas = citasFiltradas.filter(c => c.estado === 'programada').length;
  const citasCompletadas = citasFiltradas.filter(c => c.estado === 'completada').length;
  const citasCanceladas = citasFiltradas.filter(c => c.estado === 'cancelada').length;
  const tasaCancelacion = totalCitas > 0 ? ((citasCanceladas / totalCitas) * 100).toFixed(1) : 0;
  const tasaCompletadas = totalCitas > 0 ? ((citasCompletadas / totalCitas) * 100).toFixed(1) : 0;

  // Médicos más solicitados
  const medicosSolicitados = medicos.map(medico => {
    const citasMedico = citasFiltradas.filter(c => c.medicoId === medico.id);
    return {
      nombre: medico.nombre,
      especialidad: medico.especialidad,
      totalCitas: citasMedico.length,
      completadas: citasMedico.filter(c => c.estado === 'completada').length,
    };
  }).sort((a, b) => b.totalCitas - a.totalCitas);

  // Citas por mes
  const citasPorMes = () => {
    const meses = {};
    citasFiltradas.forEach(cita => {
      const fecha = new Date(cita.fecha);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      meses[mesKey] = (meses[mesKey] || 0) + 1;
    });
    return meses;
  };

  const mesesData = citasPorMes();
  const mesesLabels = Object.keys(mesesData).sort();
  const mesesValues = mesesLabels.map(m => mesesData[m]);

  // Gráfico de citas por mes
  const chartCitasPorMes = {
    labels: mesesLabels,
    datasets: [{
      label: 'Citas',
      data: mesesValues,
      backgroundColor: 'rgba(10, 77, 104, 0.8)',
      borderColor: 'rgba(10, 77, 104, 1)',
      borderWidth: 2,
    }],
  };

  // Gráfico de estado de citas
  const chartEstadoCitas = {
    labels: ['Programadas', 'Completadas', 'Canceladas', 'En Proceso'],
    datasets: [{
      data: [
        citasProgramadas,
        citasCompletadas,
        citasCanceladas,
        citasFiltradas.filter(c => c.estado === 'en_proceso').length
      ],
      backgroundColor: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B'],
    }],
  };

  // Exportaciones
  const exportarCitas = () => {
    const datos = citasFiltradas.map(c => ({
      Fecha: formatDate(c.fecha),
      Hora: c.hora,
      Paciente: pacientes.find(p => p.id === c.pacienteId)?.nombre || 'Desconocido',
      Médico: medicos.find(m => m.id === c.medicoId)?.nombre || 'Desconocido',
      Motivo: c.motivo || '-',
      Estado: c.estado,
    }));
    exportToExcel(datos, 'Reporte_Citas');
  };

  const exportarCitasPDF = () => {
    const datos = citasFiltradas.map(c => ({
      fecha: formatDate(c.fecha),
      hora: c.hora,
      paciente: pacientes.find(p => p.id === c.pacienteId)?.nombre || 'Desconocido',
      medico: medicos.find(m => m.id === c.medicoId)?.nombre || 'Desconocido',
      estado: c.estado,
    }));

    const columns = [
      { header: 'Fecha', field: 'fecha' },
      { header: 'Hora', field: 'hora' },
      { header: 'Paciente', field: 'paciente' },
      { header: 'Médico', field: 'medico' },
      { header: 'Estado', field: 'estado' },
    ];

    exportToPDF(datos, columns, 'Reporte de Citas');
  };

  const exportarMedicosPDF = () => {
    const datos = medicosSolicitados.map(m => ({
      nombre: m.nombre,
      especialidad: m.especialidad,
      totalCitas: m.totalCitas,
      completadas: m.completadas,
      tasa: m.totalCitas > 0 ? `${((m.completadas / m.totalCitas) * 100).toFixed(1)}%` : '0%',
    }));

    const columns = [
      { header: 'Médico', field: 'nombre' },
      { header: 'Especialidad', field: 'especialidad' },
      { header: 'Total Citas', field: 'totalCitas' },
      { header: 'Completadas', field: 'completadas' },
      { header: 'Tasa', field: 'tasa' },
    ];

    exportToPDF(datos, columns, 'Médicos Más Solicitados');
  };

  const limpiarFiltros = () => {
    setStartDate('');
    setEndDate('');
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <ContentWrapper>
          <main style={styles.content}>
            <Spinner />
          </main>
        </ContentWrapper>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <main style={styles.content}>
          <div style={styles.header}>
            <h1 style={styles.title}>📊 Reportes y Análisis</h1>
          </div>

          {/* Filtro de fechas */}
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClear={limpiarFiltros}
          />

          {/* Cards de resumen */}
          <div style={styles.cardsGrid}>
            <ReportCard
              title="Total de Citas"
              icon="📅"
              value={totalCitas}
              subtitle={startDate || endDate ? 'En el período seleccionado' : 'Todas las citas'}
              color="#3B82F6"
            />
            <ReportCard
              title="Citas Completadas"
              icon="✓"
              value={citasCompletadas}
              subtitle={`${tasaCompletadas}% del total`}
              color="#10B981"
            />
            <ReportCard
              title="Citas Canceladas"
              icon="✗"
              value={citasCanceladas}
              subtitle={`${tasaCancelacion}% del total`}
              color="#EF4444"
            />
            <ReportCard
              title="Total Pacientes"
              icon="👥"
              value={pacientes.length}
              subtitle="Registrados en el sistema"
              color="#F59E0B"
            />
          </div>

          {/* Botones de exportación */}
          <div style={styles.exportButtons}>
            <button style={styles.btnExport} onClick={exportarCitas}>
              📥 Exportar Citas a Excel
            </button>
            <button style={styles.btnExport} onClick={exportarCitasPDF}>
              📄 Exportar Citas a PDF
            </button>
            <button style={styles.btnExport} onClick={exportarMedicosPDF}>
              📄 Exportar Médicos a PDF
            </button>
          </div>

          {/* Gráficos */}
          <div style={styles.chartsGrid}>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>📈 Citas por Mes</h3>
              <div style={styles.chartContainer}>
                <Bar data={chartCitasPorMes} options={chartOptions} />
              </div>
            </div>

            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>📊 Estado de Citas</h3>
              <div style={styles.chartContainer}>
                <Pie data={chartEstadoCitas} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Tabla de médicos más solicitados */}
          <div style={styles.tableSection}>
            <h2 style={styles.sectionTitle}>👨‍⚕️ Médicos Más Solicitados</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Médico</th>
                    <th style={styles.th}>Especialidad</th>
                    <th style={styles.th}>Total Citas</th>
                    <th style={styles.th}>Completadas</th>
                    <th style={styles.th}>Tasa de Éxito</th>
                  </tr>
                </thead>
                <tbody>
                  {medicosSolicitados.slice(0, 10).map((m, index) => (
                    <tr key={index} style={styles.tr}>
                      <td style={styles.td}>{m.nombre}</td>
                      <td style={styles.td}>
                        <span style={styles.badge}>{m.especialidad}</span>
                      </td>
                      <td style={styles.td}>{m.totalCitas}</td>
                      <td style={styles.td}>{m.completadas}</td>
                      <td style={styles.td}>
                        {m.totalCitas > 0
                          ? `${((m.completadas / m.totalCitas) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
    maxWidth: '1800px',
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
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748B',
    fontSize: 'clamp(1rem, 3vw, 1.125rem)',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  exportButtons: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  btnExport: {
    padding: '0.75rem 1.5rem',
    background: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  chartCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  chartTitle: {
    fontSize: 'clamp(1rem, 3vw, 1.125rem)',
    color: '#1E293B',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  chartContainer: {
    height: '300px',
    position: 'relative',
  },
  tableSection: {
    marginTop: '2rem',
  },
  sectionTitle: {
    fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
    color: '#0A4D68',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  tableContainer: {
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    background: '#F1F5F9',
    fontWeight: '600',
    color: '#1E293B',
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
  },
  tr: {
    borderTop: '1px solid #E2E8F0',
  },
  td: {
    padding: '1rem',
    color: '#64748B',
    fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.65rem',
    borderRadius: '9999px',
    background: '#10B981',
    color: 'white',
    fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
    fontWeight: '600',
  },
};

export default Reportes;