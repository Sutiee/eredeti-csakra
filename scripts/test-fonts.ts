import jsPDF from 'jspdf';

const doc = new jsPDF();
console.log('Available fonts:', doc.getFontList());

// Test Hungarian characters with helvetica
doc.setFont('helvetica', 'normal');
doc.setFontSize(12);
doc.text('Test: áéíóöőúüű ÁÉÍÓÖŐÚÜŰ', 20, 20);

console.log('\nHelvetica font test created');
