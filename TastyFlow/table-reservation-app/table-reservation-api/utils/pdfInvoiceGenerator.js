const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateInvoicePDF(invoice, user, callback) {
  try {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      callback(null, pdfData);
    });

    // === COLORS & STYLES ===
    const colors = {
      primary: '#003366',     // Dark blue
      secondary: '#F5F7FA',   // Light grey
      accent: '#FF9900',      // Orange
      text: '#333333',
      lightText: '#666666',
      border: '#DDDDDD'
    };

    // === HEADER SECTION ===
const logoPath = path.join(__dirname, '../../table-reservation-client/src/assets', 'LOGO_1.png');
if (fs.existsSync(logoPath)) {
  doc.image(logoPath, 50, 40, { width: 60 });
}

// Company name (next to logo)
doc
  .fillColor(colors.primary)
  .fontSize(20)
  .font('Helvetica-Bold')
  .text('TastyFlow', 120, 60);

// Address block on the right side
doc
  .fillColor(colors.lightText)
  .fontSize(10)
  .font('Helvetica')
  .text('123 Foodie Street', 350, 50, { align: 'right', width: 200 })
  .text('Flavor Town, FT 45678', 350, 65, { align: 'right', width: 200 })
  .text('Email: support@tastyflow.com', 350, 80, { align: 'right', width: 200 });

// Divider under header
doc
  .moveTo(50, 120)
  .lineTo(550, 120)
  .strokeColor(colors.primary)
  .lineWidth(1.5)
  .stroke();


    // === INVOICE DETAILS BOX ===
    doc
      .roundedRect(350, 140, 200, 80, 5)
      .fillColor(colors.secondary)
      .fill();

    doc
      .fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('INVOICE DETAILS', 360, 150);

    doc
      .fillColor(colors.text)
      .font('Helvetica')
      .fontSize(10)
      .text(`Invoice #: ${invoice.invoiceNumber}`, 360, 170)
      .text(`Date: ${invoice.invoiceDate ? new Date(invoice.invoiceDate).toDateString() : new Date().toDateString()}`, 360, 185);

    // === BILL TO ===
    doc
      .fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Bill To:', 50, 150);

    doc
      .fillColor(colors.text)
      .font('Helvetica')
      .fontSize(10)
      .text(user.name, 50, 170)
      .text(`Email: ${user.email}`, 50, 185)
      .text(`Contact: ${user.contact || 'N/A'}`, 50, 200);

    // === RESERVATION INFO ===
    if (invoice.reservedTableInfo == null) {
      doc
        .fillColor(colors.primary)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Reservation Info:', 50, 230);

      doc
        .fillColor(colors.text)
        .font('Helvetica')
        .fontSize(10)
        .text(`Table No: ${invoice.reservedTableInfo.tableNumber}`, 50, 250)
        .text(`Slot: ${invoice.reservedTableInfo.slotTime}`, 50, 265)
        .text(`Date: ${invoice.reservedTableInfo.date ? new Date(invoice.reservedTableInfo.date).toDateString() : 'N/A'}`, 50, 280);
    }

    // === ORDER TABLE HEADER ===
    let tableTop = 320;

    doc
      .rect(50, tableTop, 500, 25)
      .fillColor(colors.primary)
      .fill();

    doc
      .fillColor('#fff')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Item', 55, tableTop + 7)
      .text('Qty', 280, tableTop + 7, { width: 50, align: 'center' })
      .text('Price', 340, tableTop + 7, { width: 80, align: 'right' })
      .text('Total', 440, tableTop + 7, { width: 90, align: 'right' });

    // === ORDER TABLE ROWS ===
    let y = tableTop + 30;
    doc.font('Helvetica').fontSize(10);

    invoice.foods.forEach((food, i) => {
      const price = food.price || 0;
      const qty = food.quantity || 0;
      const total = price * qty;

      // Alternate background
      if (i % 2 === 0) {
        doc.fillColor(colors.secondary).rect(50, y - 5, 500, 20).fill();
      }

      doc.fillColor(colors.text);
      doc.text(food.name || 'N/A', 55, y);
      doc.text(qty.toString(), 280, y, { width: 50, align: 'center' });
      doc.text(price.toFixed(2), 340, y, { width: 80, align: 'right' });
      doc.text(total.toFixed(2), 440, y, { width: 90, align: 'right' });

      y += 20;
    });

    // === SUMMARY BOX ===
    y += 20;
    doc
      .roundedRect(300, y, 250, 100, 8)
      .fillColor(colors.secondary)
      .fill();

    y += 10;
    const summaryLine = (label, value, bold = false) => {
      doc
        .fillColor(colors.text)
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(11)
        .text(label, 310, y)
        .text(value.toFixed(2), 500, y, { width: 40, align: 'right' });
      y += 18;
    };

    summaryLine('Subtotal:', invoice.subtotal || 0);
    summaryLine('CGST:', invoice.cgst || 0);
    summaryLine('SGST:', invoice.sgst || 0);
    summaryLine('Round Off:', invoice.roundOff || 0);
    summaryLine('Total:', invoice.finalAmount || invoice.totalAmount || 0, true);

    // === FOOTER ===
    doc.moveTo(50, 720).lineTo(550, 720).strokeColor(colors.border).lineWidth(0.5).stroke();

    doc
      .fontSize(10)
      .fillColor(colors.lightText)
      .text('Thank you for dining with TastyFlow!', 50, 740, { align: 'center', width: 500 })
      .text('For any queries contact support@tastyflow.com', 50, 755, { align: 'center', width: 500 });

    doc.end();
  } catch (error) {
    callback(error);
  }
}

module.exports = { generateInvoicePDF };
