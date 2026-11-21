/** Filtro de rango de fechas (desde / hasta) con opción de limpiar. */
const DateRangeFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, onClear }) => (
  <div className="date-range" role="group" aria-label="Periodo">
    <div className="field">
      <label className="field-label" htmlFor="rango-desde">Desde</label>
      <input
        id="rango-desde"
        type="date"
        className="field-input"
        value={startDate}
        max={endDate || undefined}
        onChange={(e) => onStartDateChange(e.target.value)}
      />
    </div>
    <div className="field">
      <label className="field-label" htmlFor="rango-hasta">Hasta</label>
      <input
        id="rango-hasta"
        type="date"
        className="field-input"
        value={endDate}
        min={startDate || undefined}
        onChange={(e) => onEndDateChange(e.target.value)}
      />
    </div>
    {(startDate || endDate) && (
      <button type="button" className="btn btn-ghost" onClick={onClear}>
        Ver todo el historial
      </button>
    )}
  </div>
);

export default DateRangeFilter;
