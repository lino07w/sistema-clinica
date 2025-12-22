import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (columns, data, fileName, title) => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha de reporte: ${new Date().toLocaleDateString()}`, 14, 30);

    // Tabla
    doc.autoTable({
        head: [columns.map(col => col.header)],
        body: data.map(row => columns.map(col => row[col.dataKey])),
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [10, 77, 104], textColor: 255 }, // Color corporativo
    });

    doc.save(`${fileName}.pdf`);
};
