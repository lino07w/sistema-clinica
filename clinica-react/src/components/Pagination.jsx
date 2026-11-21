import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZES = [10, 25, 50, 100];
const MAX_VISIBLE = 5;

const visiblePages = (currentPage, totalPages) => {
  let start = Math.max(1, currentPage - Math.floor(MAX_VISIBLE / 2));
  const end = Math.min(totalPages, start + MAX_VISIBLE - 1);
  start = Math.max(1, Math.min(start, end - MAX_VISIBLE + 1));
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <nav className="pagination" aria-label="Paginación">
      <p className="pagination-info tabular">
        {startItem}–{endItem} de {totalItems}
      </p>

      <div className="pagination-pages">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>
        {visiblePages(currentPage, totalPages).map((page) => (
          <button
            key={page}
            type="button"
            className={`btn btn-sm pagination-page ${page === currentPage ? 'is-current' : 'btn-ghost'}`}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <label className="pagination-size">
        Filas por página
        <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))}>
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </label>
    </nav>
  );
};

export default Pagination;
