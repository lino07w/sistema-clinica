import { exportToExcel, exportToPDF } from '../utils/exportUtils';

/** Usa las columnas recibidas o las infiere a partir de la primera fila. */
const resolveColumns = (columns, data) => {
    if (Array.isArray(columns) && columns.length > 0) return columns;
    return Object.keys(data[0] || {}).map((key) => ({ header: key, dataKey: key }));
};

const ExportButtons = ({ data, fileName, title = 'Reporte', columns: columnsProp = [] }) => {

    const handleExportExcel = async () => {
        try {
            if (!data || data.length === 0) {
                alert('No hay datos para exportar');
                return;
            }

            const columns = resolveColumns(columnsProp, data);

            // Formatear datos para Excel
            const formattedData = data.map(item => {
                const row = {};
                columns.forEach(col => {
                    row[col.header] = item[col.dataKey] || '';
                });
                return row;
            });

            await exportToExcel(formattedData, fileName);
        } catch (error) {
            console.error('Error exportando a Excel:', error);
            alert('Error al exportar a Excel: ' + error.message);
        }
    };

    const handleExportPDF = async () => {
        try {
            if (!data || data.length === 0) {
                alert('No hay datos para exportar');
                return;
            }

            const columns = resolveColumns(columnsProp, data);

            // Formatear datos para PDF
            const formattedData = data.map(item => {
                const row = {};
                columns.forEach(col => {
                    row[col.dataKey] = item[col.dataKey] || '';
                });
                return row;
            });

            await exportToPDF(formattedData, columns, title);
        } catch (error) {
            console.error('Error exportando a PDF:', error);
            alert('Error al exportar a PDF: ' + error.message);
        }
    };

    return (
        <div style={styles.container}>
            <button
                style={styles.btnExcel}
                onClick={handleExportExcel}
                title="Exportar a Excel"
            >
                📥 Excel
            </button>
            <button
                style={styles.btnPDF}
                onClick={handleExportPDF}
                title="Exportar a PDF"
            >
                📄 PDF
            </button>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    btnExcel: {
        padding: '0.625rem 1rem',
        background: '#10B981',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.875rem',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    btnPDF: {
        padding: '0.625rem 1rem',
        background: '#EF4444',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.875rem',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
};

export default ExportButtons;