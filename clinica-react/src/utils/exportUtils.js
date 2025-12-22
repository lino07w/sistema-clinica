import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exporta datos a Excel
 */
export const exportToExcel = (data, fileName) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Error exportando a Excel:', error);
    throw error;
  }
};

/**
 * Exporta datos a PDF con tabla
 */
export const exportToPDF = (data, columns, title) => {
  try {
    // Crear documento PDF
    const doc = new jsPDF();

    // Configurar título
    doc.setFontSize(16);
    doc.setTextColor(10, 77, 104);
    doc.text(String(title || 'Reporte'), 14, 20);

    // Fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(100);
    const fecha = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Generado: ${fecha}`, 14, 28);

    // Preparar datos para la tabla
    const tableData = data.map(item => {
      return columns.map(col => {
        const value = item[col.dataKey];
        return value !== undefined && value !== null ? String(value) : '-';
      });
    });

    // Preparar encabezados
    const headers = columns.map(col => col.header);

    // Generar tabla usando autoTable (forma funcional)
    autoTable(doc, {
      startY: 35,
      head: [headers],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [10, 77, 104],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10,
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      styles: {
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left',
      },
      margin: { top: 35, left: 14, right: 14 },
      didDrawPage: function (data) {
        // Footer con número de página
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      },
    });

    // Guardar PDF
    const fileName = `${title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error('Error completo exportando a PDF:', error);
    throw new Error(`Error al generar PDF: ${error.message}`);
  }
};

/**
 * Filtra datos por rango de fechas
 */
export const filterByDateRange = (data, dateField, startDate, endDate) => {
  if (!startDate && !endDate) return data;

  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    const start = startDate ? new Date(startDate) : new Date('1900-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-12-31');

    return itemDate >= start && itemDate <= end;
  });
};

/**
 * Formatea fecha a formato peruano
 */
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-PE');
};

/**
 * Calcula estadísticas de un campo numérico
 */
export const calculateStats = (data, field) => {
  const values = data.map(item => parseFloat(item[field]) || 0);

  return {
    total: values.reduce((a, b) => a + b, 0),
    average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
    max: Math.max(...values),
    min: Math.min(...values),
  };
};