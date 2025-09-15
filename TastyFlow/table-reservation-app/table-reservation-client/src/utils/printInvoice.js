const generatePrintInvoiceHTML = (invoice) => {
  const finalAmount = invoice.finalAmount || invoice.totalAmount;
  const discount = invoice.discount || 0;

  return `
    <html>
      <head>
        <title>Invoice - ${invoice.invoiceNumber}</title>
        <style>
          /* Print-specific styles */
          @page {
            size: auto; /* Auto size for thermal paper */
            margin: 0; /* No margin to maximize space */
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 10px; /* Smaller font size for compact layout */
            line-height: 1.2; /* Tight line spacing */
            margin: 0;
            padding: 0;
            color: #000; /* Black text for thermal printers */
            background: #fff; /* White background */
          }
          .invoice-print-container {
            width: 100%;
            max-width: 80mm; /* Adjust for 58mm or 80mm paper */
            margin: 0 auto;
            padding: 5px; /* Minimal padding */
          }
          .invoice-print-header {
            text-align: center;
            margin-bottom: 5px;
          }
          .invoice-print-header h2 {
            font-size: 14px; /* Slightly larger for headings */
            margin: 0;
            color: #000;
          }
          .invoice-print-header p {
            font-size: 10px;
            margin: 3px 0;
            color: #000;
          }
          .invoice-print-company {
            text-align: center;
            margin-bottom: 5px;
          }
          .invoice-print-company h3 {
            font-size: 12px;
            margin: 0 0 3px 0;
            color: #000;
          }
          .invoice-print-company p {
            font-size: 10px;
            margin: 2px 0;
            color: #000;
          }
          .invoice-print-user {
            margin-bottom: 5px;
            padding: 5px 0;
            border-top: 1px dashed #000; /* Dashed border for separation */
            border-bottom: 1px dashed #000;
          }
          .invoice-print-user h5 {
            font-size: 12px;
            margin: 0 0 3px 0;
            color: #000;
          }
          .invoice-print-user p {
            font-size: 10px;
            margin: 2px 0;
            color: #000;
          }
          .invoice-print-food {
            margin-bottom: 5px;
          }
          .invoice-print-food h5 {
            font-size: 12px;
            margin: 0 0 3px 0;
            color: #000;
          }
          .invoice-print-food table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
          }
          .invoice-print-food th,
          .invoice-print-food td {
            padding: 3px;
            text-align: left;
            border-bottom: 1px dashed #000; /* Dashed border for table rows */
          }
          .invoice-print-food th {
            font-weight: bold;
            background-color: #f0f0f0; /* Light gray background for headers */
          }
          .invoice-print-tax {
            margin-bottom: 5px;
          }
          .invoice-print-tax .invoice-print-total {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            margin-bottom: 3px;
          }
          .invoice-print-final {
            font-size: 12px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
            padding-top: 5px;
            border-top: 2px solid #000; /* Solid border for emphasis */
          }
          .invoice-print-reservation {
            margin-bottom: 5px;
            padding: 5px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
          }
          .invoice-print-reservation h5 {
            font-size: 12px;
            margin: 0 0 3px 0;
            color: #000;
          }
          .invoice-print-reservation p {
            font-size: 10px;
            margin: 2px 0;
            color: #000;
          }
          .invoice-print-footer {
            text-align: center;
            font-size: 10px;
            color: #000;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-print-container">
          <div class="invoice-print-header">
            <h2>TastyFlow</h2>
            <p>Invoice No: ${invoice.invoiceNumber}</p>
            <p>Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
          </div>

          <div class="invoice-print-company">
            <h3>Restaurant Details</h3>
            <p>Shlok Infinity, 1st Floor, Sundersingh Bhandari Overbridge, Opposite Vishvakarma Temple</p>
            <p>Phone: (909) 91-49101</p>
          </div>

          <div class="invoice-print-user">
            <h5>Bill To:</h5>
            <p><strong>Name:</strong> ${invoice.userId.name}</p>
            <p><strong>Contact:</strong> ${invoice.userId.contact}</p>
          </div>

          <div class="invoice-print-food">
            <h5>Items Purchased</h5>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.foods.map((food, index) => `
                  <tr>
                    <td>${food.name}</td>
                    <td>${food.quantity}</td>
                    <td>${(food.price || 0).toFixed(2)}</td>
                    <td>${((food.quantity || 0) * (food.price || 0)).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="invoice-print-tax">
            ${discount > 0 ? `<div class="invoice-print-total"><span>Discount:</span> <span>-₹${discount.toFixed(2)}</span></div>` : ''}
            <div class="invoice-print-total"><span>CGST (2.5%):</span> <span>₹${(invoice.cgst || 0).toFixed(2)}</span></div>
            <div class="invoice-print-total"><span>SGST (2.5%):</span> <span>₹${(invoice.sgst || 0).toFixed(2)}</span></div>
            <div class="invoice-print-total"><span>Round-off:</span> <span>₹${(invoice.roundOff || 0).toFixed(2)}</span></div>
          </div>

          <div class="invoice-print-final">
            <div>Total Payable:</div>
            <div>₹${finalAmount.toFixed(2)}</div>
          </div>

          ${
            invoice.reservedTableInfo
              ? `
            <div class="invoice-print-reservation">
              <h5>Reservation Details</h5>
              <p><strong>Table No:</strong> ${invoice.reservedTableInfo.tableNumber}</p>
              <p><strong>Reservation Slot:</strong> ${invoice.reservedTableInfo.slotTime}</p>
              <p><strong>Reservation Fee:</strong> ₹100 (included in total)</p>
            </div>
          `
              : ''
          }

          <div class="invoice-print-footer">
            <p>Thank you for dining with us!</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export default generatePrintInvoiceHTML;
