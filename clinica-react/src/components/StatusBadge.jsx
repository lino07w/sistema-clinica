/** Etiqueta de estado coherente en toda la app (citas, facturas, usuarios). */
const STATUS = {
  programada: { label: 'Programada', className: 'status-scheduled' },
  completada: { label: 'Atendida', className: 'status-done' },
  cancelada: { label: 'Cancelada', className: 'status-cancelled' },
  pagada: { label: 'Pagada', className: 'status-done' },
  pendiente: { label: 'Pendiente', className: 'status-pending' },
  anulada: { label: 'Anulada', className: 'status-cancelled' },
  activo: { label: 'Activo', className: 'status-done' },
  inactivo: { label: 'Inactivo', className: 'status-cancelled' },
  rechazado: { label: 'Rechazado', className: 'status-cancelled' },
};

const StatusBadge = ({ estado }) => {
  const status = STATUS[estado] ?? { label: estado ?? 'Sin estado', className: 'status-pending' };
  return <span className={`status ${status.className}`}>{status.label}</span>;
};

export default StatusBadge;
