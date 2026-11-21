import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { citasAPI, medicosAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import DateRangeFilter from '../components/DateRangeFilter';
import Spinner from '../components/Spinner';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { formatShortDate, normalizeTime } from '../utils/dates';
import '../config/chart';
import '../styles/Page.css';

const ESTADOS = [
  { key: 'programada', label: 'Programadas' },
  { key: 'completada', label: 'Atendidas' },
  { key: 'cancelada', label: 'Canceladas' },
];

const ESTADO_LABEL = { programada: 'Programada', completada: 'Atendida', cancelada: 'Cancelada' };

const percent = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);

const monthLabel = (yyyymm) => {
  const [year, month] = yyyymm.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
};

/** Colores del tema activo (los gráficos no leen variables CSS por sí mismos). */
const readChartColors = () => {
  const css = getComputedStyle(document.documentElement);
  const token = (name) => css.getPropertyValue(name).trim();
  return { bar: token('--petrol'), grid: token('--line'), text: token('--ink-soft') };
};

/**
 * Opciones de barras siguiendo la skill dataviz: una sola serie y un solo
 * tono, sin leyenda, barras de hasta 24 px con extremo redondeado de 4 px,
 * rejilla fina y discreta, y tooltip activado.
 */
const barOptions = (colors, { horizontal = false } = {}) => ({
  indexAxis: horizontal ? 'y' : 'x',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { displayColors: false, padding: 10 },
  },
  scales: {
    x: {
      grid: { display: horizontal, color: colors.grid, drawTicks: false },
      border: { display: false },
      ticks: { color: colors.text, precision: 0, padding: 6 },
      beginAtZero: true,
    },
    y: {
      grid: { display: !horizontal, color: colors.grid, drawTicks: false },
      border: { display: false },
      ticks: { color: colors.text, precision: 0, padding: 6 },
      beginAtZero: true,
    },
  },
});

const barDataset = (data, colors) => ({
  data,
  backgroundColor: colors.bar,
  hoverBackgroundColor: colors.bar,
  maxBarThickness: 24,
  borderRadius: 4,
  borderSkipped: 'start',
});

const Reportes = () => {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const [citas, setCitas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const cargarDatos = useCallback(async () => {
    try {
      const [citasRes, medicosRes] = await Promise.all([citasAPI.getAll(), medicosAPI.getAll()]);
      setCitas(citasRes.data?.data ?? []);
      setMedicos(medicosRes.data?.data ?? []);
    } catch (error) {
      console.error('Error cargando reportes:', error);
      addToast('No se pudieron cargar los datos de los reportes.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Las fechas son 'YYYY-MM-DD': se comparan como texto, sin pasar por UTC.
  const citasFiltradas = useMemo(
    () => citas.filter((c) => (!startDate || c.fecha >= startDate) && (!endDate || c.fecha <= endDate)),
    [citas, startDate, endDate]
  );

  const resumen = useMemo(() => {
    const porEstado = Object.fromEntries(
      ESTADOS.map(({ key }) => [key, citasFiltradas.filter((c) => c.estado === key).length])
    );
    return { total: citasFiltradas.length, porEstado };
  }, [citasFiltradas]);

  const citasPorMes = useMemo(() => {
    const meses = {};
    citasFiltradas.forEach((c) => {
      const key = String(c.fecha).slice(0, 7);
      meses[key] = (meses[key] ?? 0) + 1;
    });
    return Object.keys(meses)
      .sort()
      .map((key) => ({ key, label: monthLabel(key), total: meses[key] }));
  }, [citasFiltradas]);

  const medicosRanking = useMemo(
    () =>
      medicos
        .map((medico) => {
          const propias = citasFiltradas.filter((c) => c.medicoId === medico.id);
          const atendidas = propias.filter((c) => c.estado === 'completada').length;
          const cerradas = propias.filter((c) => c.estado !== 'programada').length;
          return {
            id: medico.id,
            nombre: medico.nombre,
            especialidad: medico.especialidad,
            total: propias.length,
            atendidas,
            cerradas,
            // Asistencia sobre citas ya cerradas (atendidas + canceladas), no sobre las futuras
            tasa: percent(atendidas, cerradas),
          };
        })
        .sort((a, b) => b.total - a.total),
    [medicos, citasFiltradas]
  );

  // Recalcular los colores cuando cambia el tema claro/oscuro
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const colors = useMemo(() => readChartColors(), [theme]);

  const chartMeses = {
    labels: citasPorMes.map((m) => m.label),
    datasets: [{ label: 'Citas', ...barDataset(citasPorMes.map((m) => m.total), colors) }],
  };
  const chartEstados = {
    labels: ESTADOS.map((e) => e.label),
    datasets: [{ label: 'Citas', ...barDataset(ESTADOS.map((e) => resumen.porEstado[e.key]), colors) }],
  };

  const runExport = async (exportFn) => {
    try {
      await exportFn();
    } catch (error) {
      console.error('Error exportando:', error);
      addToast('No se pudo generar el archivo. Inténtalo de nuevo.', 'error');
    }
  };

  const filasCitas = () =>
    citasFiltradas.map((c) => ({
      fecha: formatShortDate(c.fecha),
      hora: normalizeTime(c.hora),
      paciente: c.paciente?.nombre ?? '',
      medico: c.medico?.nombre ?? '',
      motivo: c.motivo || '',
      estado: ESTADO_LABEL[c.estado] ?? c.estado,
    }));

  const exportarCitasExcel = () =>
    runExport(() =>
      exportToExcel(
        filasCitas().map(({ fecha, hora, paciente, medico, motivo, estado }) => ({
          Fecha: fecha,
          Hora: hora,
          Paciente: paciente,
          Médico: medico,
          Motivo: motivo,
          Estado: estado,
        })),
        'Reporte_Citas'
      )
    );

  const exportarCitasPDF = () =>
    runExport(() =>
      exportToPDF(
        filasCitas(),
        [
          { header: 'Fecha', dataKey: 'fecha' },
          { header: 'Hora', dataKey: 'hora' },
          { header: 'Paciente', dataKey: 'paciente' },
          { header: 'Médico', dataKey: 'medico' },
          { header: 'Estado', dataKey: 'estado' },
        ],
        'Reporte de citas'
      )
    );

  const exportarMedicosPDF = () =>
    runExport(() =>
      exportToPDF(
        medicosRanking.map((m) => ({ ...m, tasa: m.cerradas ? `${m.tasa}%` : '—' })),
        [
          { header: 'Médico', dataKey: 'nombre' },
          { header: 'Especialidad', dataKey: 'especialidad' },
          { header: 'Citas', dataKey: 'total' },
          { header: 'Atendidas', dataKey: 'atendidas' },
          { header: 'Asistencia', dataKey: 'tasa' },
        ],
        'Citas por médico'
      )
    );

  const periodo =
    startDate || endDate
      ? `Del ${startDate ? formatShortDate(startDate) : 'inicio'} al ${endDate ? formatShortDate(endDate) : 'hoy'}`
      : 'Todo el historial';

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <main className="page">
          <div className="page-header">
            <div>
              <h1 className="page-title">Reportes</h1>
              <p className="page-subtitle">{periodo}</p>
            </div>
            <div className="export-buttons" role="group" aria-label="Exportar">
              <button type="button" className="btn btn-secondary" onClick={exportarCitasExcel} disabled={!resumen.total}>
                <FileSpreadsheet size={16} aria-hidden="true" />
                Citas en Excel
              </button>
              <button type="button" className="btn btn-secondary" onClick={exportarCitasPDF} disabled={!resumen.total}>
                <FileText size={16} aria-hidden="true" />
                Citas en PDF
              </button>
              <button type="button" className="btn btn-secondary" onClick={exportarMedicosPDF} disabled={!medicos.length}>
                <FileText size={16} aria-hidden="true" />
                Médicos en PDF
              </button>
            </div>
          </div>

          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClear={() => {
              setStartDate('');
              setEndDate('');
            }}
          />

          {loading ? (
            <Spinner />
          ) : (
            <>
              <dl className="figures">
                <div>
                  <dt>Citas</dt>
                  <dd className="tabular">{resumen.total}</dd>
                </div>
                {ESTADOS.map(({ key, label }) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd className="tabular">
                      {resumen.porEstado[key]}
                      <span className="figures-share">{percent(resumen.porEstado[key], resumen.total)}%</span>
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="charts">
                <section className="panel" aria-labelledby="chart-meses">
                  <h2 id="chart-meses" className="section-title">Citas por mes</h2>
                  <div className="chart-box">
                    <Bar data={chartMeses} options={barOptions(colors)} aria-label="Gráfico de citas por mes" role="img" />
                  </div>
                </section>
                <section className="panel" aria-labelledby="chart-estados">
                  <h2 id="chart-estados" className="section-title">Citas por estado</h2>
                  <div className="chart-box chart-box-short">
                    <Bar
                      data={chartEstados}
                      options={barOptions(colors, { horizontal: true })}
                      aria-label="Gráfico de citas por estado"
                      role="img"
                    />
                  </div>
                </section>
              </div>

              <section aria-labelledby="ranking-title">
                <h2 id="ranking-title" className="section-title">Citas por médico</h2>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Médico</th>
                        <th>Especialidad</th>
                        <th className="cell-amount">Citas</th>
                        <th className="cell-amount">Atendidas</th>
                        <th className="cell-amount" title="Atendidas sobre citas ya cerradas (atendidas y canceladas)">
                          Asistencia
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicosRanking.map((m) => (
                        <tr key={m.id}>
                          <td>{m.nombre}</td>
                          <td>{m.especialidad}</td>
                          <td className="cell-amount tabular">{m.total}</td>
                          <td className="cell-amount tabular">{m.atendidas}</td>
                          <td className="cell-amount tabular">{m.cerradas ? `${m.tasa}%` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>
      </ContentWrapper>
    </>
  );
};

export default Reportes;
