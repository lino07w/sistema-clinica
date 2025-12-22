import { exportToExcel, exportToPDF } from '../utils/exportUtils';

const ExportButtons = ({ data, fileName, title = 'Reporte', columns = [] }) => {

    const handleExportExcel = () => {
        try {
            if (!data || data.length === 0) {
                alert('No hay datos para exportar');
                return;
            }

            // Si no se pasan columnas, inferirlas desde la primera fila
            if (!Array.isArray(columns) || columns.length === 0) {
                const first = data[0] || {};
                columns = Object.keys(first).map(k => ({ header: k, dataKey: k }));
            }

            // Formatear datos para Excel
            const formattedData = data.map(item => {
                const row = {};
                columns.forEach(col => {
                    row[col.header] = item[col.dataKey] || '';
                });
                return row;
            });

            exportToExcel(formattedData, fileName);
        } catch (error) {
            console.error('Error exportando a Excel:', error);
            alert('Error al exportar a Excel: ' + error.message);
        }
    };

    const handleExportPDF = () => {
        try {
            if (!data || data.length === 0) {
                alert('No hay datos para exportar');
                return;
            }

            // Si no se pasan columnas, inferirlas desde la primera fila
            if (!Array.isArray(columns) || columns.length === 0) {
                const first = data[0] || {};
                columns = Object.keys(first).map(k => ({ header: k, dataKey: k }));
            }

            // Formatear datos para PDF
            const formattedData = data.map(item => {
                const row = {};
                columns.forEach(col => {
                    row[col.dataKey] = item[col.dataKey] || '';
                });
                return row;
            });

            exportToPDF(formattedData, columns, title);
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