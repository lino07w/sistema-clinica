import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { pacientesAPI, medicosAPI, citasAPI, usuariosAPI, facturasAPI } from '../services/api';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import Spinner from '../components/Spinner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user, isAdmin, isMedico, isRecepcionista, isPaciente } = useAuth();
  const [stats, setStats] = useState({
    pacientes: 0,
    medicos: 0,
    citas: 0,
    citasPendientes: 0,
    citasHoy: 0,
    citasSemana: 0,
    usuariosPendientes: 0,
    citasCanceladas: 0,
    totalFacturado: 0,
    eficiencia: 0,
  });
  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Estado para filtros de fecha
  const [dateFilter, setDateFilter] = useState({
    start: '',
    end: ''
  });

  // Citas filtradas calculadas dinámicamente
  const filteredCitas = useMemo(() => {
    return citas.filter(c => {
      if (!c.fecha) return false;
      const fechaCita = c.fecha;
      const startValid = !dateFilter.start || fechaCita >= dateFilter.start;
      const endValid = !dateFilter.end || fechaCita <= dateFilter.end;
      return startValid && endValid;
    });
  }, [citas, dateFilter]);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      if (isAdmin()) {
        // Admin ve estadísticas completas + datos para gráficos
        const [pacientesRes, medicosRes, citasRes, usuariosRes, facturasRes] = await Promise.all([
          pacientesAPI.getAll(),
          medicosAPI.getAll(),
          citasAPI.getAll(),
          usuariosAPI.getPendientes().catch(() => ({ data: [] })),
          facturasAPI.getAll().catch(() => ({ data: [] }))
        ]);

        const pacientesData = pacientesRes.data?.data || pacientesRes.data || [];
        const medicosData = medicosRes.data?.data || medicosRes.data || [];
        const citasData = citasRes.data?.data || citasRes.data || [];
        const usuariosData = usuariosRes.data?.data || usuariosRes.data || [];
        const facturasData = facturasRes.data?.data || facturasRes.data || [];

        setPacientes(pacientesData);
        setCitas(citasData);
        setUsuarios(usuariosData);

        // Calcular estadísticas
        const hoy = new Date().toISOString().split('T')[0];
        const inicioSemana = new Date();
        inicioSemana.setDate(inicioSemana.getDate() - 7);
        const inicioSemanaStr = inicioSemana.toISOString().split('T')[0];

        const citasPendientes = citasData.filter(c => c.estado === 'programada').length;
        const citasHoy = citasData.filter(c => c.fecha === hoy).length;
        const citasSemana = citasData.filter(c => c.fecha >= inicioSemanaStr && c.fecha <= hoy).length;
        const citasCanceladas = citasData.filter(c => c.estado === 'cancelada').length;
        const citasCompletadas = citasData.filter(c => c.estado === 'completada').length;

        const totalFacturado = facturasData
          .filter(f => f.estado === 'pagada')
          .reduce((acc, curr) => acc + (curr.monto || 0), 0);

        const eficiencia = citasData.length > 0
          ? Math.round((citasCompletadas / (citasCompletadas + citasCanceladas)) * 100) || 0
          : 0;

        setStats({
          pacientes: pacientesData.length,
          medicos: medicosData.length,
          citas: citasData.length,
          citasPendientes,
          citasHoy,
          citasSemana,
          usuariosPendientes: usuariosData.length,
          citasCanceladas,
          totalFacturado,
          eficiencia,
        });
      } else if (isRecepcionista()) {
        // Recepcionista ve estadísticas básicas (SIN gráficos)
        const [pacientesRes, medicosRes, citasRes] = await Promise.all([
          pacientesAPI.getAll(),
          medicosAPI.getAll(),
          citasAPI.getAll()
        ]);

        const pacientesData = pacientesRes.data?.data || pacientesRes.data || [];
        const medicosData = medicosRes.data?.data || medicosRes.data || [];
        const citasData = citasRes.data?.data || citasRes.data || [];

        const citasPendientes = citasData.filter(c => c.estado === 'programada').length;

        setStats({
          pacientes: pacientesData.length,
          medicos: medicosData.length,
          citas: citasData.length,
          citasPendientes,
        });
      } else if (isMedico()) {
        // Médico solo ve sus estadísticas básicas
        const [medicosRes, citasRes] = await Promise.all([
          medicosAPI.getAll(),
          citasAPI.getAll()
        ]);

        const medicosData = medicosRes.data?.data || medicosRes.data || [];
        const citasData = citasRes.data?.data || citasRes.data || [];

        const citasPendientes = citasData.filter(c => c.estado === 'programada').length;

        setStats({
          pacientes: 0,
          medicos: medicosData.length,
          citas: citasData.length,
          citasPendientes,
        });
      } else if (isPaciente()) {
        // Paciente solo ve sus propias citas
        const citasRes = await citasAPI.getAll();
        const citasData = citasRes.data?.data || citasRes.data || [];

        const citasPendientes = citasData.filter(c => c.estado === 'programada').length;
        const citasCompletadas = citasData.filter(c => c.estado === 'completada').length;

        setStats({
          pacientes: 0,
          medicos: 0,
          citas: citasData.length,
          citasPendientes,
          citasCompletadas,
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Datos para gráfico de estado de citas (SOLO ADMIN)
  const getChartEstadoCitas = () => {
    const programadas = filteredCitas.filter(c => c.estado === 'programada').length;
    const completadas = filteredCitas.filter(c => c.estado === 'completada').length;
    const canceladas = filteredCitas.filter(c => c.estado === 'cancelada').length;
    const enProceso = filteredCitas.filter(c => c.estado === 'en_proceso').length;

    return {
      labels: ['Programadas', 'Completadas', 'Canceladas', 'En Proceso'],
      datasets: [
        {
          label: 'Citas por Estado',
          data: [programadas, completadas, canceladas, enProceso],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(245, 158, 11, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Datos para gráfico de citas por mes (SOLO ADMIN)
  const getChartCitasPorMes = () => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mesActual = new Date().getMonth();
    const ultimos6Meses = [];
    const citasPorMes = [];

    for (let i = 5; i >= 0; i--) {
      const mes = (mesActual - i + 12) % 12;
      ultimos6Meses.push(meses[mes]);

      const citasDelMes = filteredCitas.filter(c => {
        if (!c.fecha) return false;
        const citaMes = new Date(c.fecha).getMonth();
        return citaMes === mes;
      }).length;

      citasPorMes.push(citasDelMes);
    }

    return {
      labels: ultimos6Meses,
      datasets: [
        {
          label: 'Citas',
          data: citasPorMes,
          backgroundColor: 'rgba(10, 77, 104, 0.8)',
          borderColor: 'rgba(10, 77, 104, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  // Datos para gráfico de tendencia de pacientes (SOLO ADMIN)
  const getChartTendenciaPacientes = () => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mesActual = new Date().getMonth();
    const ultimos6Meses = [];
    const pacientesPorMes = [];

    for (let i = 5; i >= 0; i--) {
      const mes = (mesActual - i + 12) % 12;
      ultimos6Meses.push(meses[mes]);

      // Simular datos (en producción, filtrar por fecha de creación)
      const pacientesDelMes = Math.floor(Math.random() * 20) + 5;
      pacientesPorMes.push(pacientesDelMes);
    }

    return {
      labels: ultimos6Meses,
      datasets: [
        {
          label: 'Nuevos Pacientes',
          data: pacientesPorMes,
          fill: true,
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 1)',
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: 'rgba(16, 185, 129, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
        },
      ],
    };
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

  const renderStatsCards = () => {
    if (isAdmin()) {
      // ADMIN: 8 cards con estadísticas avanzadas
      return (
        <>
          <div style={{ ...styles.statCard, borderLeft: '4px solid #3B82F6' }}>
            <div style={styles.statIcon}>👥</div>
            <div>
              <h3 style={styles.statValue}>{stats.pacientes}</h3>
              <p style={styles.statLabel}>Total Pacientes</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #10B981' }}>
            <div style={styles.statIcon}>👨‍⚕️</div>
            <div>
              <h3 style={styles.statValue}>{stats.medicos}</h3>
              <p style={styles.statLabel}>Médicos Activos</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #F59E0B' }}>
            <div style={styles.statIcon}>📅</div>
            <div>
              <h3 style={styles.statValue}>{stats.citas}</h3>
              <p style={styles.statLabel}>Total Citas</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #EF4444' }}>
            <div style={styles.statIcon}>⏰</div>
            <div>
              <h3 style={styles.statValue}>{stats.citasPendientes}</h3>
              <p style={styles.statLabel}>Citas Pendientes</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #8B5CF6' }}>
            <div style={styles.statIcon}>📆</div>
            <div>
              <h3 style={styles.statValue}>{stats.citasHoy}</h3>
              <p style={styles.statLabel}>Citas Hoy</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #06B6D4' }}>
            <div style={styles.statIcon}>📊</div>
            <div>
              <h3 style={styles.statValue}>{stats.citasSemana}</h3>
              <p style={styles.statLabel}>Citas Esta Semana</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #EC4899' }}>
            <div style={styles.statIcon}>⏳</div>
            <div>
              <h3 style={styles.statValue}>{stats.usuariosPendientes}</h3>
              <p style={styles.statLabel}>Solicitudes Pendientes</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #64748B' }}>
            <div style={styles.statIcon}>✗</div>
            <div>
              <h3 style={styles.statValue}>{stats.citasCanceladas}</h3>
              <p style={styles.statLabel}>Citas Canceladas</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #10B981' }}>
            <div style={styles.statIcon}>💰</div>
            <div>
              <h3 style={styles.statValue}>${stats.totalFacturado.toLocaleString()}</h3>
              <p style={styles.statLabel}>Total Facturado (Mensual)</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #088395' }}>
            <div style={styles.statIcon}>📈</div>
            <div>
              <h3 style={styles.statValue}>{stats.eficiencia}%</h3>
              <p style={styles.statLabel}>Eficiencia de Citas</p>
            </div>
          </div>
        </>
      );
    }

    if (isRecepcionista()) {
      // RECEPCIONISTA: 4 cards básicas
      return (
        <>
          <div style={{ ...styles.statCard, borderLeft: '4px solid #3B82F6' }}>
            <div style={styles.statIcon}>👥</div>
            <div>
              <h3 style={styles.statValue}>{stats.pacientes}</h3>
              <p style={styles.statLabel}>Pacientes Registrados</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #10B981' }}>
            <div style={styles.statIcon}>👨‍⚕️</div>
            <div>
              <h3 style={styles.statValue}>{stats.medicos}</h3>
              <p style={styles.statLabel}>Médicos Activos</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #F59E0B' }}>
            <div style={styles.statIcon}>📅</div>
            <div>
              <h3 style={styles.statValue}>{stats.citas}</h3>
              <p style={styles.statLabel}>Total de Citas</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #EF4444' }}>
            <div style={styles.statIcon}>⏰</div>
            <div>
              <h3 style={styles.statValue}>{stats.citasPendientes}</h3>
              <p style={styles.statLabel}>Citas Pendientes</p>
            </div>
          </div>
        </>
      );
    }

    if (isMedico()) {
      // MÉDICO: 3 cards
      return (
        <>
          <div style={{ ...styles.statCard, borderLeft: '4px solid #F59E0B' }}>
            <div style={styles.statIcon}>📅</div>
            <div>
              <h3 style={styles.statValue}>{stats.citas}</h3>
              <p style={styles.statLabel}>Mis Citas Totales</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #EF4444' }}>
            <div style={styles.statIcon}>⏰</div>
            <div>
              <h3 style={styles.statValue}>{stats.citasPendientes}</h3>
              <p style={styles.statLabel}>Citas Pendientes</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #10B981' }}>
            <div style={styles.statIcon}>👨‍⚕️</div>
            <div>
              <h3 style={styles.statValue}>{stats.medicos}</h3>
              <p style={styles.statLabel}>Médicos en el Sistema</p>
            </div>
          </div>
        </>
      );
    }

    if (isPaciente()) {
      return (
        <>
          <div style={{ ...styles.statCard, borderLeft: '4px solid #F59E0B' }}>
            <div style={styles.statIcon}>📅</div>
            <div>
              <h3 style={styles.statValue}>{stats.citas}</h3>
              <p style={styles.statLabel}>Mis Citas Totales</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #EF4444' }}>
            <div style={styles.statIcon}>⏰</div>
            <div>
              <h3 style={styles.statValue}>{stats.citasPendientes}</h3>
              <p style={styles.statLabel}>Citas Próximas</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: '4px solid #10B981' }}>
            <div style={styles.statIcon}>✅</div>
            <div>
              <h3 style={styles.statValue}>{stats.citasCompletadas || 0}</h3>
              <p style={styles.statLabel}>Citas Completadas</p>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  const getWelcomeMessage = () => {
    if (isAdmin()) return 'Panel de Administración';
    if (isMedico()) return 'Panel del Médico';
    if (isRecepcionista()) return 'Panel de Recepción';
    if (isPaciente()) return 'Mi Panel Personal';
    return 'Dashboard';
  };

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <main style={styles.content}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>{getWelcomeMessage()}</h1>
              <p style={styles.subtitle}>Bienvenido/a, {user?.nombre || user?.username}</p>
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <>
              {/* Cards de Estadísticas */}
              <div style={styles.statsGrid}>
                {renderStatsCards()}
              </div>

              {/* Filtros para gráficos - SOLO ADMIN */}
              {isAdmin() && (
                <div style={styles.filterSection}>
                  <div style={styles.filterTitle}>Filtrar Gráficos:</div>
                  <div style={styles.filterControls}>
                    <input
                      type="date"
                      style={styles.dateInput}
                      value={dateFilter.start}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                      placeholder="Fecha Inicio"
                    />
                    <span style={{ color: 'var(--text-secondary)' }}>hasta</span>
                    <input
                      type="date"
                      style={styles.dateInput}
                      value={dateFilter.end}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                      placeholder="Fecha Fin"
                    />
                    {(dateFilter.start || dateFilter.end) && (
                      <button
                        style={styles.btnReset}
                        onClick={() => setDateFilter({ start: '', end: '' })}
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Gráficos - SOLO PARA ADMIN */}
              {isAdmin() && citas.length > 0 && (
                <div style={styles.chartsGrid}>
                  {/* Gráfico de Estado de Citas */}
                  <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>📊 Distribución de Citas por Estado</h3>
                    <div style={styles.chartContainer}>
                      <Pie data={getChartEstadoCitas()} options={chartOptions} />
                    </div>
                  </div>

                  {/* Gráfico de Citas por Mes */}
                  <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>📈 Citas por Mes (Últimos 6 meses)</h3>
                    <div style={styles.chartContainer}>
                      <Bar data={getChartCitasPorMes()} options={chartOptions} />
                    </div>
                  </div>

                  {/* Gráfico de Tendencia de Pacientes */}
                  <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>📉 Tendencia de Nuevos Pacientes</h3>
                    <div style={styles.chartContainer}>
                      <Line data={getChartTendenciaPacientes()} options={chartOptions} />
                    </div>
                  </div>
                </div>
              )}

              {/* Tablas de Actividad Reciente - SOLO ADMIN */}
              {isAdmin() && (
                <div style={styles.activitySection}>
                  {/* Últimas Citas */}
                  {citas.length > 0 && (
                    <div style={styles.activityCard}>
                      <h3 style={styles.activityTitle}>📋 Últimas Citas Programadas</h3>
                      <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.th}>Fecha</th>
                              <th style={styles.th}>Hora</th>
                              <th style={styles.th}>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {citas.slice(0, 5).map((cita, index) => (
                              <tr key={index} style={styles.tr}>
                                <td style={styles.td}>{cita.fecha}</td>
                                <td style={styles.td}>{cita.hora}</td>
                                <td style={styles.td}>
                                  <span style={{
                                    ...styles.badge,
                                    background: cita.estado === 'programada' ? '#3B82F6' :
                                      cita.estado === 'completada' ? '#10B981' :
                                        cita.estado === 'cancelada' ? '#EF4444' : '#F59E0B'
                                  }}>
                                    {cita.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Últimos Pacientes */}
                  {pacientes.length > 0 && (
                    <div style={styles.activityCard}>
                      <h3 style={styles.activityTitle}>👥 Últimos Pacientes Registrados</h3>
                      <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.th}>Nombre</th>
                              <th style={styles.th}>DNI</th>
                              <th style={styles.th}>Teléfono</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pacientes.slice(0, 5).map((paciente, index) => (
                              <tr key={index} style={styles.tr}>
                                <td style={styles.td}>{paciente.nombre}</td>
                                <td style={styles.td}>{paciente.dni}</td>
                                <td style={styles.td}>{paciente.telefono || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Solicitudes Pendientes */}
                  {usuarios.length > 0 && (
                    <div style={styles.activityCard}>
                      <h3 style={styles.activityTitle}>⏳ Solicitudes Pendientes de Aprobación</h3>
                      <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.th}>Nombre</th>
                              <th style={styles.th}>Email</th>
                              <th style={styles.th}>Rol</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usuarios.slice(0, 5).map((usuario, index) => (
                              <tr key={index} style={styles.tr}>
                                <td style={styles.td}>{usuario.nombre}</td>
                                <td style={styles.td}>{usuario.email}</td>
                                <td style={styles.td}>
                                  <span style={styles.badge}>
                                    {usuario.rol}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Información adicional según el rol */}
              <div style={styles.infoSection}>
                {isAdmin() && (
                  <div style={styles.infoCard}>
                    <h3 style={styles.infoTitle}>🔑 Panel de Control Completo</h3>
                    <p style={styles.infoText}>
                      Tienes acceso total al sistema. Gestiona usuarios, pacientes, médicos, citas y
                      aprueba solicitudes de nuevas cuentas. Monitorea el rendimiento general de la clínica.
                    </p>
                  </div>
                )}

                {isMedico() && (
                  <div style={styles.infoCard}>
                    <h3 style={styles.infoTitle}>👨‍⚕️ Panel Médico</h3>
                    <p style={styles.infoText}>
                      Puedes ver y gestionar tus citas programadas. Actualiza el estado de
                      las consultas y mantén el registro de tus pacientes.
                    </p>
                  </div>
                )}

                {isRecepcionista() && (
                  <div style={styles.infoCard}>
                    <h3 style={styles.infoTitle}>📋 Panel de Recepción</h3>
                    <p style={styles.infoText}>
                      Gestiona las citas, registra nuevos pacientes y coordina las consultas
                      con los médicos disponibles.
                    </p>
                  </div>
                )}

                {isPaciente() && (
                  <div style={styles.infoCard}>
                    <h3 style={styles.infoTitle}>🧑 Panel Personal</h3>
                    <p style={styles.infoText}>
                      Consulta tus citas programadas, historial de consultas y mantén
                      actualizada tu información personal.
                    </p>
                  </div>
                )}
              </div>
            </>
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
    padding: 'clamp(1.5rem, 3vw, 2rem)',
    maxWidth: '1800px',
    margin: '0 auto',
    minHeight: '100vh',
    background: 'var(--bg-main)',
  },
  header: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: 'clamp(1.5rem, 5vw, 2rem)',
    color: 'var(--primary-dark)',
    marginBottom: '0.5rem',
    fontWeight: '700',
    margin: 0,
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: 'clamp(0.875rem, 3vw, 1rem)',
    marginTop: '0.5rem',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-secondary)',
    fontSize: 'clamp(1rem, 3vw, 1.125rem)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'var(--bg-card)',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  statIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.25rem',
    background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    flexShrink: 0,
    color: 'white',
  },
  statValue: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
    margin: 0,
  },
  statLabel: {
    color: 'var(--text-secondary)',
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
    fontWeight: '500',
    margin: 0,
    marginTop: '0.25rem',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  chartCard: {
    background: 'var(--bg-card)',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: 'var(--shadow-md)',
  },
  chartTitle: {
    fontSize: 'clamp(1rem, 3vw, 1.125rem)',
    color: 'var(--text-primary)',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  chartContainer: {
    height: '300px',
    position: 'relative',
  },
  activitySection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  activityCard: {
    background: 'var(--bg-card)',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: 'var(--shadow-md)',
  },
  activityTitle: {
    fontSize: 'clamp(1rem, 3vw, 1.125rem)',
    color: 'var(--text-primary)',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '0.75rem',
    textAlign: 'left',
    background: 'var(--bg-hover)',
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
  },
  tr: {
    borderTop: '1px solid var(--border-color)',
  },
  td: {
    padding: '0.75rem',
    color: 'var(--text-secondary)',
    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
  },
  filterSection: {
    background: 'var(--bg-card)',
    padding: '1rem',
    borderRadius: '1rem',
    marginBottom: '1.5rem',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  filterTitle: {
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  filterControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  dateInput: {
    padding: '0.5rem',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
  },
  btnReset: {
    padding: '0.5rem 1rem',
    background: 'var(--bg-hover)',
    color: 'var(--text-secondary)',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.65rem',
    borderRadius: '9999px',
    color: 'white',
    fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
    fontWeight: '600',
    background: 'var(--primary-dark)',
    textTransform: 'capitalize',
  },
  infoSection: {
    marginTop: '2rem',
    padding: '1rem',
    background: 'var(--bg-card)',
    borderRadius: '1rem',
  },
  infoCard: {
    textAlign: 'center',
    padding: '1rem',
  },
  infoTitle: {
    fontSize: '1.25rem',
    color: 'var(--primary-dark)',
    marginBottom: '0.5rem',
  },
  infoText: {
    color: 'var(--text-secondary)',
  },
};

export default Dashboard;