import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { citasAPI, facturasAPI, usuariosAPI } from '../services/api';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import {
  addDays,
  currentTime,
  formatCurrency,
  formatLongDate,
  formatShortDate,
  normalizeTime,
  toLocalISODate,
  weekRange,
} from '../utils/dates';
import '../styles/Agenda.css';

/** Horario de atención mostrado en la agenda (las citas fuera de él también se ven). */
const OPENING_HOUR = 8;
const CLOSING_HOUR = 19;

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

/** Agrupa las citas del día por hora ("08", "09"...) e incluye las horas libres. */
const buildTimeline = (citasDelDia) => {
  const byHour = new Map();
  for (let hour = OPENING_HOUR; hour <= CLOSING_HOUR; hour++) {
    byHour.set(String(hour).padStart(2, '0'), []);
  }
  citasDelDia.forEach((cita) => {
    const hour = normalizeTime(cita.hora).slice(0, 2);
    if (!byHour.has(hour)) byHour.set(hour, []);
    byHour.get(hour).push(cita);
  });
  return [...byHour.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, citas]) => ({
      hour,
      citas: [...citas].sort((a, b) => normalizeTime(a.hora).localeCompare(normalizeTime(b.hora))),
    }));
};

const describeDay = (count, isToday) => {
  if (count === 0) return isToday ? 'No hay citas para hoy.' : 'No hay citas este día.';
  return `${count} ${count === 1 ? 'cita' : 'citas'}${isToday ? ' hoy' : ''}`;
};

/** Línea horizontal que marca la hora actual dentro de la agenda. */
const NowMarker = ({ time }) => (
  <div className="timeline-now" role="note" aria-label={`Hora actual ${time}`}>
    <span className="timeline-now-time tabular">{time}</span>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rol = user?.rol;
  const isAdmin = rol === 'administrador';
  const isMedico = rol === 'medico';
  const canSchedule = isAdmin || rol === 'recepcionista';

  const today = toLocalISODate();
  const [selectedDate, setSelectedDate] = useState(today);
  const [now, setNow] = useState(currentTime());
  const [citas, setCitas] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDatos = useCallback(async () => {
    setError('');
    try {
      const [citasRes, facturasRes, solicitudesRes] = await Promise.all([
        citasAPI.getAll(),
        canSchedule ? facturasAPI.getAll() : null,
        isAdmin ? usuariosAPI.getPendientes() : null,
      ]);
      setCitas(unwrap(citasRes));
      setFacturas(facturasRes ? unwrap(facturasRes) : []);
      setSolicitudes(solicitudesRes ? unwrap(solicitudesRes) : []);
    } catch {
      setError('No se pudo cargar la agenda. Revisa tu conexión y vuelve a intentarlo.');
    } finally {
      setLoading(false);
    }
  }, [canSchedule, isAdmin]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Mantener la marca de "ahora" al día sin recargar la página
  useEffect(() => {
    const timer = setInterval(() => setNow(currentTime()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const isToday = selectedDate === today;
  const citasDelDia = useMemo(() => citas.filter((c) => c.fecha === selectedDate), [citas, selectedDate]);
  const timeline = useMemo(() => buildTimeline(citasDelDia), [citasDelDia]);

  const semana = useMemo(() => {
    const { start, end } = weekRange(selectedDate);
    const enSemana = citas.filter((c) => c.fecha >= start && c.fecha <= end);
    const count = (estado) => enSemana.filter((c) => c.estado === estado).length;
    return {
      start,
      end,
      programadas: count('programada'),
      completadas: count('completada'),
      canceladas: count('cancelada'),
    };
  }, [citas, selectedDate]);

  const cobradoMes = useMemo(() => {
    const month = selectedDate.slice(0, 7);
    return facturas
      .filter((f) => f.estado === 'pagada' && String(f.fecha).startsWith(month))
      .reduce((total, f) => total + (Number(f.monto) || 0), 0);
  }, [facturas, selectedDate]);

  const proximas = useMemo(
    () =>
      citas
        .filter((c) => c.estado === 'programada')
        .filter((c) => c.fecha > today || (c.fecha === today && normalizeTime(c.hora) >= now))
        .sort((a, b) =>
          `${a.fecha} ${normalizeTime(a.hora)}`.localeCompare(`${b.fecha} ${normalizeTime(b.hora)}`)
        )
        .slice(0, 4),
    [citas, today, now]
  );

  const nuevaCita = (hora = '') =>
    navigate('/citas', { state: { nuevaCita: { fecha: selectedDate, hora } } });

  // La marca "ahora" va antes de la primera hora posterior a la actual
  const nowHour = now.slice(0, 2);
  const nowIndex = isToday ? timeline.findIndex(({ hour }) => hour > nowHour) : -1;
  const nowAfterAll = isToday && nowIndex === -1;

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <main className="agenda-page">
          <header className="agenda-header">
            <div>
              <h1 className="agenda-date">{formatLongDate(selectedDate)}</h1>
              <p className="agenda-subtitle">
                {isMedico ? 'Tu agenda. ' : ''}
                {loading ? 'Cargando citas…' : describeDay(citasDelDia.length, isToday)}
              </p>
            </div>

            <div className="agenda-controls">
              <div className="agenda-daynav" role="group" aria-label="Cambiar de día">
                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  onClick={() => setSelectedDate((d) => addDays(d, -1))}
                  aria-label="Día anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedDate(today)}
                  disabled={isToday}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  onClick={() => setSelectedDate((d) => addDays(d, 1))}
                  aria-label="Día siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <label className="visually-hidden" htmlFor="agenda-fecha">Ir a una fecha</label>
              <input
                id="agenda-fecha"
                type="date"
                className="agenda-datepicker"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              />
              {canSchedule && (
                <button type="button" className="btn btn-primary" onClick={() => nuevaCita()}>
                  <Plus size={16} aria-hidden="true" />
                  Nueva cita
                </button>
              )}
            </div>
          </header>

          {error && (
            <div className="agenda-error" role="alert">
              <span>{error}</span>
              <button type="button" className="btn btn-secondary" onClick={cargarDatos}>
                Reintentar
              </button>
            </div>
          )}

          <div className="agenda-layout">
            <section className="agenda-day" aria-label={`Citas del ${formatLongDate(selectedDate)}`}>
              {loading ? (
                <Spinner />
              ) : (
                <ol className="timeline">
                  {timeline.map(({ hour, citas: citasHora }, index) => {
                    const isPast = isToday && hour < nowHour;
                    return (
                    <li key={hour} className={`timeline-hour ${isPast ? 'is-past' : ''}`}>
                      {index === nowIndex && <NowMarker time={now} />}
                      <div className="timeline-slot">
                        <span className="timeline-time tabular">{hour}:00</span>
                        <div className="timeline-entries">
                          {citasHora.length === 0 &&
                            (canSchedule && !isPast && selectedDate >= today ? (
                              <button
                                type="button"
                                className="timeline-free"
                                onClick={() => nuevaCita(`${hour}:00`)}
                                aria-label={`Agendar una cita a las ${hour}:00`}
                              >
                                <span>Libre</span>
                                <span className="timeline-free-action" aria-hidden="true">
                                  <Plus size={14} /> Agendar
                                </span>
                              </button>
                            ) : (
                              <span className="timeline-free">Libre</span>
                            ))}
                          {citasHora.map((cita) => (
                            <article key={cita.id} className={`appointment appointment-${cita.estado}`}>
                              {/* La hora sólo se repite si no coincide con la del bloque (p. ej. 08:30) */}
                              {normalizeTime(cita.hora) !== `${hour}:00` && (
                                <span className="appointment-time tabular">{normalizeTime(cita.hora)}</span>
                              )}
                              <div className="appointment-body">
                                <h3 className="appointment-patient">
                                  {cita.paciente?.nombre ?? 'Paciente sin datos'}
                                </h3>
                                <p className="appointment-detail">
                                  {cita.medico
                                    ? `${cita.medico.nombre}, ${cita.medico.especialidad}`
                                    : 'Médico sin asignar'}
                                </p>
                                {cita.motivo && <p className="appointment-reason">{cita.motivo}</p>}
                              </div>
                              <StatusBadge estado={cita.estado} />
                            </article>
                          ))}
                        </div>
                      </div>
                    </li>
                    );
                  })}
                  {nowAfterAll && (
                    <li className="timeline-hour">
                      <NowMarker time={now} />
                    </li>
                  )}
                </ol>
              )}
            </section>

            <aside className="agenda-aside">
              <section className="aside-block">
                <h2 className="aside-title">
                  Semana del {formatShortDate(semana.start)} al {formatShortDate(semana.end)}
                </h2>
                <dl className="aside-figures">
                  <div>
                    <dt>Programadas</dt>
                    <dd className="tabular">{semana.programadas}</dd>
                  </div>
                  <div>
                    <dt>Atendidas</dt>
                    <dd className="tabular">{semana.completadas}</dd>
                  </div>
                  <div>
                    <dt>Canceladas</dt>
                    <dd className="tabular">{semana.canceladas}</dd>
                  </div>
                  {canSchedule && (
                    <div>
                      <dt>Cobrado en el mes</dt>
                      <dd className="tabular">{formatCurrency(cobradoMes)}</dd>
                    </div>
                  )}
                </dl>
              </section>

              {isAdmin && solicitudes.length > 0 && (
                <section className="aside-block aside-notice">
                  <UserPlus size={18} aria-hidden="true" />
                  <p>
                    {solicitudes.length === 1
                      ? '1 profesional espera aprobación.'
                      : `${solicitudes.length} profesionales esperan aprobación.`}{' '}
                    <Link to="/solicitudes">Revisar solicitudes</Link>
                  </p>
                </section>
              )}

              <section className="aside-block">
                <h2 className="aside-title">Próximas citas</h2>
                {proximas.length === 0 ? (
                  <p className="aside-empty">No hay citas programadas desde ahora.</p>
                ) : (
                  <ul className="upcoming">
                    {proximas.map((cita) => (
                      <li key={cita.id}>
                        <button
                          type="button"
                          className="upcoming-item"
                          onClick={() => setSelectedDate(cita.fecha)}
                        >
                          <span className="upcoming-when tabular">
                            {cita.fecha === today ? 'Hoy' : formatShortDate(cita.fecha)}, {normalizeTime(cita.hora)}
                          </span>
                          <span className="upcoming-who">{cita.paciente?.nombre}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {isAdmin && (
                <p className="aside-footnote">
                  Las métricas detalladas están en <Link to="/reportes">Reportes</Link>.
                </p>
              )}
            </aside>
          </div>
        </main>
      </ContentWrapper>
    </>
  );
};

export default Dashboard;
