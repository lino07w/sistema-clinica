// Las librerías de exportación son pesadas (~600 kB): se cargan bajo demanda
// con import() dinámico, sólo cuando el usuario exporta algo.

/**
 * Exporta datos a Excel
 * @param {object[]} data  Filas; las claves se usan como encabezados.
 * @param {string} fileName Nombre del archivo sin extensión.
 */
export const exportToExcel = async (data, fileName) => {
  try {
    const XLSX = await import('xlsx');
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
 * @param {object[]} data
 * @param {{ header: string, dataKey: string }[]} columns
 * @param {string} title
 */
export const exportToPDF = async (data, columns, title = 'Reporte') => {
  try {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);

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
