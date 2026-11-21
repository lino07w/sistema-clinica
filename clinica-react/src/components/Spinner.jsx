/** Indicador de carga accesible. */
const Spinner = ({ label = 'Cargando…' }) => (
  <div className="spinner-wrap" role="status">
    <span className="spinner" aria-hidden="true" />
    <span className="visually-hidden">{label}</span>
  </div>
);

export default Spinner;
