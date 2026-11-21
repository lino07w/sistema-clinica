import Spinner from './Spinner';

/** Pantalla de carga mientras se descarga el código de una página (React.lazy). */
const Loading = () => (
  <div className="loading-screen">
    <Spinner />
  </div>
);

export default Loading;
