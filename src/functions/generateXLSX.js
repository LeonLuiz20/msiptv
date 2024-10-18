const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

module.exports.generateXLSX = async function(data) {

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Ordens");

    const dirPath = path.join('C:\\Users\\leonl\\OneDrive\\Documentos\\', 'MIG_IPTV');

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    let time = new Date;
    let xlsxName = 'IPTV_' + time.getFullYear() + ('00' + (time.getMonth() + 1)).slice(-2) + ('00' + time.getDate()).slice(-2) + ('00' + time.getHours()).slice(-2) + ('00' + time.getMinutes()).slice(-2) + ('00' + time.getSeconds()).slice(-2) + '_open.xlsx';

    const filePath = path.join(dirPath, xlsxName);

    XLSX.writeFile(workbook, filePath);

    return xlsxName;

}