/**
 * Contenedor del contenido de cada página. El desplazamiento respecto a la
 * barra lateral (expandida, contraída o móvil) se resuelve sólo con CSS
 * (ver styles/Navbar.css), por eso debe renderizarse justo después de <Navbar />.
 */
const ContentWrapper = ({ children }) => <div className="content-wrapper">{children}</div>;

export default ContentWrapper;
