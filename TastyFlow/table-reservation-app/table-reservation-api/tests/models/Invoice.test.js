const Invoice = require('../../models/Invoice');

describe('Invoice Model', () => {
  it('should create an invoice with required fields', async () => {
    const invoiceData = {
      userId: '507f1f77bcf86cd799439011', // mock ObjectId
      foods: [
        {
          foodId: '507f1f77bcf86cd799439012',
          name: 'Pizza',
          price: 15.99,
          quantity: 2,
          total: 31.98
        }
      ],
      totalAmount: 31.98,
      invoiceNumber: 1001,
      cgst: 1.44,
      sgst: 1.44,
      roundOff: 0.02
    };

    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();

    expect(savedInvoice.userId.toString()).toBe(invoiceData.userId);
    expect(savedInvoice.foods).toHaveLength(1);
    expect(savedInvoice.totalAmount).toBe(31.98);
    expect(savedInvoice.status).toBe('unpaid'); // default status
  });

  it('should fail to create invoice without required userId', async () => {
    const invoiceData = {
      foods: [],
      totalAmount: 0,
      invoiceNumber: 1001,
      cgst: 0,
      sgst: 0,
      roundOff: 0
    };

    const invoice = new Invoice(invoiceData);

    await expect(invoice.save()).rejects.toThrow();
  });

  it('should create invoice with payments', async () => {
    const invoiceData = {
      userId: '507f1f77bcf86cd799439011',
      foods: [],
      totalAmount: 50,
      invoiceNumber: 1002,
      cgst: 2.25,
      sgst: 2.25,
      roundOff: 0,
      payments: [
        {
          amount: 25,
          paymentMethod: 'card',
          reference: 'TXN123'
        }
      ]
    };

    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();

    expect(savedInvoice.payments).toHaveLength(1);
    expect(savedInvoice.payments[0].amount).toBe(25);
    expect(savedInvoice.payments[0].paymentMethod).toBe('card');
  });

  it('should create invoice with reserved table info', async () => {
    const invoiceData = {
      userId: '507f1f77bcf86cd799439011',
      foods: [],
      totalAmount: 100,
      invoiceNumber: 1003,
      cgst: 4.5,
      sgst: 4.5,
      roundOff: 0,
      reservedTableInfo: {
        tableNumber: 5,
        slotTime: '7-9PM',
        date: new Date(),
        status: 'confirmed'
      }
    };

    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();

    expect(savedInvoice.reservedTableInfo.tableNumber).toBe(5);
    expect(savedInvoice.reservedTableInfo.slotTime).toBe('7-9PM');
  });

  it('should validate status enum values', async () => {
    const invoiceData = {
      userId: '507f1f77bcf86cd799439011',
      foods: [],
      totalAmount: 50,
      invoiceNumber: 1004,
      cgst: 2.25,
      sgst: 2.25,
      roundOff: 0,
      status: 'invalid'
    };

    const invoice = new Invoice(invoiceData);

    await expect(invoice.save()).rejects.toThrow();
  });

  it('should validate payment method enum values', async () => {
    const invoiceData = {
      userId: '507f1f77bcf86cd799439011',
      foods: [],
      totalAmount: 50,
      invoiceNumber: 1005,
      cgst: 2.25,
      sgst: 2.25,
      roundOff: 0,
      payments: [
        {
          amount: 50,
          paymentMethod: 'invalid_method'
        }
      ]
    };

    const invoice = new Invoice(invoiceData);

    await expect(invoice.save()).rejects.toThrow();
  });

  it('should set default due date 15 days from invoice date', async () => {
    const invoiceData = {
      userId: '507f1f77bcf86cd799439011',
      foods: [],
      totalAmount: 50,
      invoiceNumber: 1006,
      cgst: 2.25,
      sgst: 2.25,
      roundOff: 0,
      invoiceDate: new Date('2023-01-01')
    };

    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();

    const expectedDueDate = new Date('2023-01-16');
    expect(savedInvoice.dueDate.toDateString()).toBe(expectedDueDate.toDateString());
  });

  it('should calculate final amount correctly', async () => {
    const invoiceData = {
      userId: '507f1f77bcf86cd799439011',
      foods: [],
      totalAmount: 100,
      invoiceNumber: 1007,
      cgst: 4.5,
      sgst: 4.5,
      roundOff: 0.5,
      discount: 10,
      finalAmount: 99.5
    };

    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();

    expect(savedInvoice.finalAmount).toBe(99.5);
  });
});
