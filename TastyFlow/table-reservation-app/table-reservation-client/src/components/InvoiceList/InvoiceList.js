import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Select, Input, message, DatePicker } from 'antd';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Sidebar from '../../components/Sidebar/Sidebar';
import ExcelJS from 'exceljs';
import "./InvoiceList.css";

const { Option } = Select;

const StatusBadge = ({ status, dueDate }) => {
  const statusColors = {
    paid: '#4CAF50',
    unpaid: '#F44336',
    partially_paid: '#FF9800',
    cancelled: '#9E9E9E',
    overdue: '#FF5722'
  };

  const displayStatus = status || 'unpaid';
  const isOverdue = (status === 'unpaid' || status === 'partially_paid') && 
                   dueDate && new Date(dueDate) < new Date();

  return (
    <div className="status-badge-container">
      <span 
        style={{
          backgroundColor: statusColors[displayStatus] || '#9E9E9E',
          color: 'white',
          padding: '3px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          textTransform: 'capitalize',
          fontWeight: '500'
        }}
      >
        {displayStatus.replace('_', ' ')}
      </span>
      {isOverdue && !['paid', 'cancelled'].includes(status) && (
        <span className="overdue-badge">Overdue</span>
      )}
    </div>
  );
};

const PaymentModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  paymentData, 
  setPaymentData, 
  selectedInvoice,
  loading 
}) => {
  const calculateDueAmount = (invoice) => {
    if (!invoice) return 0;
    const totalPaid = invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const amount = invoice.finalAmount || invoice.totalAmount || 0;
    return Math.max(0, amount - totalPaid);
  };

  return (
    <Modal
      title={`Record Payment for Invoice #${selectedInvoice?.invoiceNumber || ''}`}
      visible={visible}
      onOk={onSubmit}
      onCancel={onCancel}
      okText="Record Payment"
      cancelText="Cancel"
      confirmLoading={loading}
    >
      <div className="payment-modal-content">
        <div className="payment-form-group">
          <label>Amount Due: ₹{selectedInvoice ? calculateDueAmount(selectedInvoice).toFixed(2) : '0.00'}</label>
        </div>
        <div className="payment-form-group">
          <label>Payment Amount</label>
          <Input
            type="number"
            value={paymentData.amount}
            onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
          />
        </div>
        <div className="payment-form-group">
          <label>Payment Method</label>
          <Select
            value={paymentData.paymentMethod}
            onChange={(value) => setPaymentData({...paymentData, paymentMethod: value})}
            style={{ width: '100%' }}
          >
            <Option value="cash">Cash</Option>
            <Option value="card">Credit/Debit Card</Option>
            <Option value="upi">UPI</Option>
            <Option value="bank_transfer">Bank Transfer</Option>
            <Option value="other">Other</Option>
          </Select>
        </div>
        <div className="payment-form-group">
          <label>Reference/Note</label>
          <Input
            value={paymentData.reference}
            onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
            placeholder="Payment reference or note"
          />
        </div>
      </div>
    </Modal>
  );
};

const CancelModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  selectedInvoice,
  loading 
}) => {
  const calculatePaidAmount = (invoice) => {
    if (!invoice) return 0;
    return invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  };

  return (
    <Modal
      title={`Cancel Invoice #${selectedInvoice?.invoiceNumber || ''}`}
      visible={visible}
      onOk={onSubmit}
      onCancel={onCancel}
      okText="Confirm Cancellation"
      cancelText="Go Back"
      okButtonProps={{ danger: true }}
      confirmLoading={loading}
    >
      <div className="cancel-modal-content">
        <div className="cancel-form-group">
          <p>You are about to cancel this invoice. This action cannot be undone.</p>
          <p><strong>Current Status:</strong> <StatusBadge status={selectedInvoice?.status} dueDate={selectedInvoice?.dueDate} /></p>
          <p><strong>Amount Paid:</strong> ₹{calculatePaidAmount(selectedInvoice).toFixed(2)}</p>
        </div>
        
        {selectedInvoice?.status === 'paid' && (
          <div className="cancel-warning">
            <p>Warning: This invoice has been fully paid. Cancelling will require issuing a refund.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    reference: '',
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [rangeModalVisible, setRangeModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const navigate = useNavigate();

  const calculateDueAmount = (invoice) => {
    if (!invoice) return 0;
    const totalPaid = invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const amount = invoice.finalAmount || invoice.totalAmount || 0;
    return Math.max(0, amount - totalPaid);
  };

const fetchInvoices = async () => {
  try {
    setLoading(true);
    const response = await axios.get('http://localhost:5000/api/invoice/admin/all-invoice');
    
    if (response.data && Array.isArray(response.data)) {
      setInvoices(response.data);
    } else {
      setInvoices([]); // Set to empty array if response data is invalid
      message.info('No invoices found');
    }
  } catch (error) {
    console.error('Error fetching invoices:', error);
    if (error.response && error.response.status === 404) {
      setInvoices([]);
    } else {
      message.error('Failed to load invoices');
    }
  } finally {
    setLoading(false);
  }
};

  const recordPayment = async () => {
    try {
      if (!selectedInvoice) {
        message.error('No invoice selected');
        return;
      }

      if (!paymentData.amount || isNaN(paymentData.amount) || parseFloat(paymentData.amount) <= 0) {
        message.error('Please enter a valid payment amount');
        return;
      }

      const dueAmount = calculateDueAmount(selectedInvoice);
      if (parseFloat(paymentData.amount) > dueAmount) {
        message.warning(`Payment amount (₹${paymentData.amount}) exceeds due amount (₹${dueAmount.toFixed(2)})`);
        return;
      }

      setLoading(true);
      const response = await axios.post(
        `http://localhost:5000/api/invoice/admin/${selectedInvoice._id}/record-payment`,
        {
          amount: parseFloat(paymentData.amount),
          paymentMethod: paymentData.paymentMethod,
          reference: paymentData.reference,
          receivedBy: '680a48f89926f3832ce1525a',
          customerName: selectedInvoice.customerName || selectedInvoice.userId?.name
        }
      );

      // Update local state with the new payment and preserve customer name
      setInvoices(prev => prev.map(inv => 
        inv._id === selectedInvoice._id ? {
          ...response.data.invoice,
          customerName: selectedInvoice.customerName || selectedInvoice.userId?.name || inv.customerName
        } : inv
      ));
      
      message.success('Payment recorded successfully');
      setPaymentModalVisible(false);
    } catch (error) {
      console.error('Error recording payment:', error);
      message.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const cancelInvoice = async () => {
    try {
      if (!selectedInvoice) {
        message.error('No invoice selected');
        return;
      }

      setLoading(true);
      const response = await axios.patch(
        `http://localhost:5000/api/invoice/admin/${selectedInvoice._id}/cancel`,
        {
          cancellationReason: 'Cancelled by admin',
          userId: '680a48f89926f3832ce1525a'
        }
      );

      setInvoices(prev => prev.map(inv => 
        inv._id === selectedInvoice._id ? response.data.invoice : inv
      ));
      message.success('Invoice cancelled successfully');
      setCancelModalVisible(false);
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      message.error(error.response?.data?.message || 'Failed to cancel invoice');
    } finally {
      setLoading(false);
    }
  };

  const showRangeModal = () => {
    setRangeModalVisible(true);
  };

  const handleRangeOk = () => {
    setRangeModalVisible(false);
    exportToExcel(dateRange[0], dateRange[1]);
  };

  const handleRangeCancel = () => {
    setRangeModalVisible(false);
    setDateRange([null, null]);
  };

  const getCustomerName = (invoice) => {
    return invoice.customerName || 
           invoice.userId?.name || 
           invoice.billingDetails?.name || 
           (invoice.payments && invoice.payments[0]?.customerName) || 
           '';
  };

  const exportToExcel = async (startDate, endDate) => {
    setExportLoading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Invoices');

      // Format utilities
      const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      };
      const formatDateTime = (date) => {
        const d = new Date(date);
        const time = d.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        return `${formatDate(d)} ${time}`;
      };

      // Header rows
      worksheet.addRow(['INVOICE REPORT']);
      worksheet.mergeCells('A1:T1');
      worksheet.addRow([]);
      worksheet.addRow([
        startDate && endDate
          ? `Report Period: ${formatDate(startDate)} to ${formatDate(endDate)}`
          : 'Report Period: All Dates',
      ]);
      worksheet.mergeCells('A3:T3');
      worksheet.addRow([`Generated On: ${formatDateTime(new Date())}`]);
      worksheet.mergeCells('A4:T4');
      worksheet.addRow([]);

      // Column headers
      const columns = [
        'Invoice #', 'Date', 'Customer', 'Reservation', 'Subtotal', 'Tax (CGST)',
        'Tax (SGST)', 'Discount', 'Round Off', 'Reservation Discount',
        'Final Amount', 'Amount Paid', 'Balance Due', 'Status', 'Due Date',
        'Payment Method', 'Notes', 'Table', 'Time Slot'
      ];
      worksheet.addRow(columns);

      // Style header
      worksheet.getRow(6).eachCell(cell => {
        cell.font = { bold: true };
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
      });

      // Filter & sort invoices
      let filteredInvoices = [...invoices];
      if (startDate && endDate) {
        filteredInvoices = invoices.filter(invoice => {
          const invoiceDate = new Date(invoice.invoiceDate);
          return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
        });
      }

      const sortedInvoices = filteredInvoices.sort((a, b) =>
        new Date(a.invoiceDate) - new Date(b.invoiceDate)
      );

      // Add invoice rows
      sortedInvoices.forEach(invoice => {
        const totalPaid = invoice.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        const amountDue = Math.max(0, (invoice.finalAmount || invoice.totalAmount || 0) - totalPaid);
        const hasReservation = invoice.reservedTableInfo ? 'Yes' : 'No';
        let originalAmount = invoice.totalAmount || 0;
        if (hasReservation === 'Yes' && originalAmount >= 100) {
          originalAmount += 100;
        }

        const row = [
          invoice.invoiceNumber || 'N/A',
          formatDate(invoice.invoiceDate),
          getCustomerName(invoice), // Using the new name lookup function
          hasReservation,
          invoice.subtotal || 0,
          invoice.cgst || 0,
          invoice.sgst || 0,
          invoice.discount || 0,
          invoice.roundOff || 0,
          hasReservation === 'Yes' ? 100 : 0,
          invoice.finalAmount || invoice.totalAmount || 0,
          totalPaid,
          amountDue,
          invoice.status
            ? invoice.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
            : 'Unpaid',
          formatDate(invoice.dueDate),
          invoice.payments?.[0]?.paymentMethod
            ? invoice.payments[0].paymentMethod
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
            : 'Not Paid',
          invoice.notes || '',
          invoice.reservedTableInfo?.tableNumber || 'N/A',
          invoice.reservedTableInfo?.slotTime || 'N/A',
        ];

        const addedRow = worksheet.addRow(row);

        addedRow.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
          };
        });
      });

      // Set column widths
      worksheet.columns.forEach(column => {
        column.width = 18;
      });

      // Generate the buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Create blob and anchor to trigger download
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fileName =
        'Invoice_Report_' +
        (startDate && endDate
          ? `${formatDate(startDate)}_to_${formatDate(endDate)}`
          : 'All_Dates') +
        `_${new Date().toISOString().split('T')[0]}.xlsx`;

      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      message.success(`Exported ${sortedInvoices.length} invoices to ${fileName}`);
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to generate report. Please check console for details.');
    } finally {
      setExportLoading(false);
    }
  };

  const navigateToInvoiceDetail = (invoiceId) => {
    navigate(`/admin/invoices/${invoiceId}`);
  };

  const navigateToEditInvoice = (invoiceId) => {
    navigate(`/admin/invoices/edit/${invoiceId}`);
  };

  const showPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      amount: calculateDueAmount(invoice).toFixed(2),
      paymentMethod: 'cash',
      reference: '',
    });
    setPaymentModalVisible(true);
  };

  const showCancelModal = (invoice) => {
    setSelectedInvoice(invoice);
    setCancelModalVisible(true);
  };

  const downloadInvoicePDF = async (invoiceId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/invoice/admin/${invoiceId}/download-pdf`,
        {
          responseType: 'blob', // Important for handling PDF downloads
        }
      );

      // Create a blob URL for the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      message.success('Invoice PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      message.error('Failed to download invoice PDF');
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="invoice-list-container">
      <Sidebar />
      
      <main className="invoice-list-content">
        <header className="invoice-list-header">
          <div className="invoice-list-header-top">
            <h1>Invoice Management</h1>
            <Button 
              type="primary" 
              onClick={showRangeModal}
              loading={exportLoading}
              className="export-btn"
            >
              Export to Excel
            </Button>
          </div>
          <p className="invoice-list-subtitle">View and manage all customer invoices</p>
        </header>

        {loading ? (
          <div className="invoice-list-loading">Loading invoice data...</div>
        ) : (
          <div className="invoice-list-view">
            <div className="invoice-list-table-container">
              <div className="invoice-list-table-header">
                <div className="invoice-list-header-item">
                  <span>DATE</span>
                </div>
                <div className="invoice-list-header-item">
                  <span>STATUS</span>
                </div>
                <div className="invoice-list-header-item">
                  <span>AMOUNT</span>
                </div>
                <div className="invoice-list-header-item">
                  <span>DUE</span>
                </div>
                <div className="invoice-list-header-item" style={{"textAlign": "center"}}>
                  <span>ACTIONS</span>
                </div>
              </div>

              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <div key={invoice._id} className="invoice-list-table-row">
                    <div className="invoice-list-row-item">
                      <span>{new Date(invoice.invoiceDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="invoice-list-row-item">
                      <StatusBadge status={invoice.status} dueDate={invoice.dueDate} />
                    </div>
                    <div className="invoice-list-row-item amount">
                      <span>₹{(invoice.finalAmount || invoice.totalAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="invoice-list-row-item amount">
                      <span style={{ 
                        color: calculateDueAmount(invoice) > 0 ? '#F44336' : '#4CAF50',
                        fontWeight: calculateDueAmount(invoice) > 0 ? '600' : 'normal'
                      }}>
                        ₹{calculateDueAmount(invoice).toFixed(2)}
                      </span>
                    </div>
                    <div className="invoice-list-row-item actions">
                      <div className="action-buttons-container">
                        <div className="action-buttons-grid">
                          <button
                            onClick={() => navigateToInvoiceDetail(invoice._id)}
                            className="invoice-list-view-btn"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => downloadInvoicePDF(invoice._id)}
                            className="invoice-list-pdf-btn"
                          >
                            Download PDF
                          </button>
                          <button
                            onClick={() => navigateToEditInvoice(invoice._id)}
                            className="invoice-list-edit-btn"
                            disabled={invoice.status === 'cancelled'}
                            title={invoice.status === 'cancelled' ? "Cannot edit cancelled invoices" : ""}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => showPaymentModal(invoice)}
                            className="invoice-list-pay-btn"
                            disabled={invoice.status === 'paid' || invoice.status === 'cancelled'}
                            title={
                              invoice.status === 'paid' ? "Invoice already paid" : 
                              invoice.status === 'cancelled' ? "Cannot pay cancelled invoice" : ""
                            }
                          >
                            Record Payment
                          </button>
                          <button
                            onClick={() => showCancelModal(invoice)}
                            className="invoice-list-cancel-btn"
                            disabled={invoice.status === 'cancelled'}
                            title={invoice.status === 'cancelled' ? "Invoice already cancelled" : ""}
                          >
                            Cancel Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="invoice-list-empty-state">
                  No invoices found in the system.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Date Range Modal */}
        <Modal
          title="Select Date Range for Export"
          visible={rangeModalVisible}
          onOk={handleRangeOk}
          onCancel={handleRangeCancel}
          okText="Export"
          cancelText="Cancel"
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
            <DatePicker
              placeholder="Start Date"
              value={dateRange[0]}
              onChange={(date) => setDateRange([date, dateRange[1]])}
              style={{ width: '100%' }}
            />
            <span>to</span>
            <DatePicker
              placeholder="End Date"
              value={dateRange[1]}
              onChange={(date) => setDateRange([dateRange[0], date])}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <Button 
              type="link" 
              onClick={() => {
                setDateRange([null, null]);
                exportToExcel(null, null);
                setRangeModalVisible(false);
              }}
            >
              Export All Data Without Date Filter
            </Button>
          </div>
        </Modal>

        <PaymentModal
          visible={paymentModalVisible}
          onCancel={() => setPaymentModalVisible(false)}
          onSubmit={recordPayment}
          paymentData={paymentData}
          setPaymentData={setPaymentData}
          selectedInvoice={selectedInvoice}
          loading={loading}
        />

        <CancelModal
          visible={cancelModalVisible}
          onCancel={() => setCancelModalVisible(false)}
          onSubmit={cancelInvoice}
          selectedInvoice={selectedInvoice}
          loading={loading}
        />
      </main>
    </div>
  );
};

export default InvoiceListPage;