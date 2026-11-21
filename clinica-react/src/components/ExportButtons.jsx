import { useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { useToast } from '../context/ToastContext';

/** Usa las columnas recibidas o las infiere a partir de la primera fila. */
const resolveColumns = (columns, data) => {
  if (Array.isArray(columns) && columns.length > 0) return columns;
  return Object.keys(data[0] || {}).map((key) => ({ header: key, dataKey: key }));
};

/** Filas con las claves que espera cada formato (encabezado para Excel, dataKey para PDF). */
const toRows = (data, columns, keyOf) =>
  data.map((item) =>
    Object.fromEntries(columns.map((col) => [keyOf(col), item[col.dataKey] ?? '']))
  );

const ExportButtons = ({ data = [], fileName, title = 'Reporte', columns: columnsProp = [] }) => {
  const { addToast } = useToast();
  const [busy, setBusy] = useState(null);
  const isEmpty = data.length === 0;

  const run = async (format) => {
    setBusy(format);
    try {
      const columns = resolveColumns(columnsProp, data);
      if (format === 'excel') {
        await exportToExcel(toRows(data, columns, (col) => col.header), fileName);
      } else {
        await exportToPDF(toRows(data, columns, (col) => col.dataKey), columns, title);
      }
    } catch (error) {
      console.error(`Error exportando a ${format}:`, error);
      addToast('No se pudo generar el archivo. Inténtalo de nuevo.', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="export-buttons" role="group" aria-label="Exportar listado">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => run('excel')}
        disabled={isEmpty || busy !== null}
        title={isEmpty ? 'No hay datos para exportar' : 'Descargar en Excel'}
      >
        <FileSpreadsheet size={16} aria-hidden="true" />
        {busy === 'excel' ? 'Generando…' : 'Excel'}
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => run('pdf')}
        disabled={isEmpty || busy !== null}
        title={isEmpty ? 'No hay datos para exportar' : 'Descargar en PDF'}
      >
        <FileText size={16} aria-hidden="true" />
        {busy === 'pdf' ? 'Generando…' : 'PDF'}
      </button>
    </div>
  );
};

export default ExportButtons;
