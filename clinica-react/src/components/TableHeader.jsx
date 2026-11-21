import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

/** Encabezado de columna ordenable (accesible con teclado y lector de pantalla). */
const TableHeader = ({ column, label, sortConfig, onSort }) => {
  const isSorted = sortConfig.key === column;
  const direction = isSorted ? sortConfig.direction : null;
  const ariaSort = direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none';
  const Icon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <th aria-sort={ariaSort}>
      <button type="button" className="sort-button" onClick={() => onSort(column)}>
        {label}
        <Icon size={14} aria-hidden="true" className={isSorted ? 'sort-icon is-active' : 'sort-icon'} />
      </button>
    </th>
  );
};

export default TableHeader;
