const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateInvoicePDF(invoice, user, callback) {
  try {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    console.log("Generating PDF for invoice:", invoice);
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      callback(null, pdfData);
    });

    // Document metadata
    doc.info.Title = `Invoice_${invoice.invoiceNumber}`;
    doc.info.Author = 'TastyFlow';

    // Header
    doc
      .fontSize(20)
      .text('TastyFlow Invoice', { align: 'center' })
      .moveDown();

    // Invoice details
    doc
      .fontSize(12)
      .text(`Invoice Number: ${invoice.invoiceNumber}`)
      .text(`Invoice Date: ${invoice.invoiceDate ? invoice.invoiceDate.toDateString() : new Date().toDateString()}`)
      .moveDown();

    // User details
    doc
      .fontSize(14)
      .text('Billed To:', { underline: true })
      .fontSize(12)
      .text(`Name: ${user.name}`)
      .text(`Email: ${user.email}`)
      .text(`Contact: ${user.contact || 'N/A'}`)
      .moveDown();

    // Reserved table info if available
    if (invoice.reservedTableInfo == null) {
      doc
        .fontSize(14)
        .text('Reservation Details:', { underline: true })
        .fontSize(12)
        .text(`Table Number: ${invoice.reservedTableInfo.tableNumber}`)
        .text(`Slot Time: ${invoice.reservedTableInfo.slotTime}`)
        .text(`Date: ${invoice.reservedTableInfo.date ? new Date(invoice.reservedTableInfo.date).toDateString() : 'N/A'}`)
        .moveDown();
    }

    // Table header for foods
    doc
      .fontSize(14)
      .text('Order Details:', { underline: true })
      .moveDown(0.5);

    // Table columns
    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 300;
    const priceX = 350;
    const totalX = 450;

    doc
      .fontSize(12)
      .text('Item', itemX, tableTop, { bold: true })
      .text('Qty', qtyX, tableTop)
      .text('Price', priceX, tableTop)
      .text('Total', totalX, tableTop);

    doc.moveDown();

    // List foods
    invoice.foods.forEach((food, i) => {
      const y = tableTop + 25 + i * 20;
      const price = food.price || 0;
      const quantity = food.quantity || 0;
      const itemTotal = price * quantity;

      doc
        .fontSize(12)
        .text(food.name || 'Unknown Item', itemX, y)
        .text(quantity, qtyX, y)
        .text(price.toFixed(2), priceX, y)
        .text(itemTotal.toFixed(2), totalX, y);
    });

    doc.moveDown(2);

    // Subtotal, taxes, round off, total
    const summaryTop = doc.y;
    const subtotal = invoice.subtotal || 0;
    const cgst = invoice.cgst || 0;
    const sgst = invoice.sgst || 0;
    const roundOff = invoice.roundOff || 0;
    const totalAmount = invoice.totalAmount || 0;

    doc
      .fontSize(12)
      .text(`Subtotal: ${subtotal.toFixed(2)}`, { align: 'right' })
      .text(`CGST: ${cgst.toFixed(2)}`, { align: 'right' })
      .text(`SGST: ${sgst.toFixed(2)}`, { align: 'right' })
      .text(`Round Off: ${roundOff.toFixed(2)}`, { align: 'right' })
      .moveDown(0.5)
      .fontSize(14)
      .text(`Total Amount: ${totalAmount.toFixed(2)}`, { align: 'right', underline: true });

    // Footer
    doc
      .fontSize(10)
      .text('Thank you for your business!', 50, 750, { align: 'center', width: 500 });

    doc.end();
  } catch (error) {
    callback(error);
  }
}

module.exports = {
  generateInvoicePDF,
};
