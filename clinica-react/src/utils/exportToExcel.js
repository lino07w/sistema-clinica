import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName) => {
    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(data);

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    // Guardar archivo
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};
