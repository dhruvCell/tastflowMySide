import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { FaUser, FaCalendarAlt, FaTable, FaClock, FaMoneyBillWave, FaIdCard, FaArrowLeft } from 'react-icons/fa';
import generatePrintInvoiceHTML from '../../utils/printInvoice';
import './UserInvoiceDetail.css';

const UserInvoiceDetail = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoiceDetail = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/invoice/user/${invoiceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token'),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Failed to load invoice details');
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      message.error('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceDetail();
  }, [invoiceId]);

  const goBack = () => {
    navigate(-1);
  };

  const printInvoice = () => {
    const printWindow = window.open('', '', 'height=800,width=1200');
    const invoiceHTML = generatePrintInvoiceHTML(invoice);

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <div className="inv-detail-loading">Loading invoice details...</div>;
  if (!invoice) return <div className="inv-detail-error">Invoice details not found.</div>;

  return (
    <div className="inv-detail-container">
      <main className="inv-detail-content">
        <header className="inv-detail-header">
          <button onClick={goBack} className="inv-detail-back-btn">
            <FaArrowLeft /> Back
          </button>
          <h1>Invoice Details</h1>
          <div className="inv-detail-meta">
            <span>Invoice: {invoice.invoiceNumber}</span>
            <span>Date: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : ''}</span>
            {invoice.reservedTableInfo && (
              <div className="ei-table-reservation">
                <span>Table {invoice.reservedTableInfo.tableNumber}</span> -
                <span> [{invoice.reservedTableInfo.slotTime}]</span>
              </div>
            )}
          </div>
        </header>

        <div className="inv-detail-view">
          <section className="inv-detail-summary">
            <div className="inv-detail-summary-grid">
              <div className="inv-detail-summary-item">
                <label>Total Amount</label>
                <p>₹{invoice.totalAmount.toFixed(2)}</p>
              </div>
              <div className="inv-detail-summary-item inv-detail-discount">
                <label>Discount</label>
                <p>-₹{invoice.discount.toFixed(2)}</p>
              </div>

              <div className="inv-detail-summary-item">
                <label>CGST (2.5%)</label>
                <p>₹{invoice.cgst.toFixed(2)}</p>
              </div>

              <div className="inv-detail-summary-item">
                <label>SGST (2.5%)</label>
                <p>₹{invoice.sgst.toFixed(2)}</p>
              </div>

              <div className="inv-detail-summary-item">
                <label>Round Off</label>
                <p>₹{invoice.roundOff.toFixed(2)}</p>
              </div>

              {invoice.reservedTableInfo && (
                <div className="inv-detail-summary-item inv-detail-discount">
                  <label>Table Reservation</label>
                  <p>-₹100.00</p>
                </div>
              )}
              <div className="inv-detail-summary-item inv-detail-total">
                <label>Final Amount</label>
                <p>₹
  {(invoice.finalAmount || invoice.totalAmount).toFixed(2)}
</p>
              </div>
            </div>
          </section>

          <section className="inv-detail-user-section">
            <h2 className="inv-detail-section-title">
              Order Information
            </h2>
            <div className="inv-detail-card">
              <div className="inv-detail-grid">
                <div className="inv-detail-item">
                  <div className="inv-detail-icon">
                    <FaUser />
                  </div>
                  <div>
                    <div className="inv-detail-label">Customer Name</div>
                    <div className="inv-detail-value">{invoice.userId?.name || 'N/A'}</div>
                  </div>
                </div>

                <div className="inv-detail-item">
                  <div className="inv-detail-icon">
                    <FaIdCard />
                  </div>
                  <div>
                    <div className="inv-detail-label">Invoice Number</div>
                    <div className="inv-detail-value">{invoice.invoiceNumber}</div>
                  </div>
                </div>

                <div className="inv-detail-item">
                  <div className="inv-detail-icon">
                    <FaCalendarAlt />
                  </div>
                  <div>
                    <div className="inv-detail-label">Invoice Date</div>
                    <div className="inv-detail-value">
                      {new Date(invoice.invoiceDate).toLocaleDateString("en-US", {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className="inv-detail-item">
                  <div className="inv-detail-icon">
                    <FaMoneyBillWave />
                  </div>
                  <div>
                    <div className="inv-detail-label">Status</div>
                    <div className="inv-detail-value">{invoice.status}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="inv-detail-items">
            <h2>Order Items</h2>
            <div className="inv-detail-items-table">
              <div className="inv-detail-table-header">
                <div>SI <br/> No.</div>
                <div>Item</div>
                <div>Price</div>
                <div>Qty</div>
                <div>Amount</div>
              </div>

              {invoice.foods.length > 0 ? (
                invoice.foods.map((food, index) => (
                  <div key={index} className="inv-detail-table-row">
                    <div>{index + 1}</div>
                    <div>{food.name}</div>
                    <div>₹{(food.price || 0).toFixed(2)}</div>
                    <div>{food.quantity}</div>
                    <div>₹{(food.quantity * food.price).toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <div className="inv-detail-empty-state">No food items available</div>
              )}
            </div>
          </section>

          {invoice.reservedTableInfo && (
            <section className="inv-detail-reservation-section">
              <h2>Reservation Details</h2>
              <div className="inv-detail-card">
                <div className="inv-detail-grid">
                  <div className="inv-detail-item">
                    <div className="inv-detail-icon">
                      <FaTable />
                    </div>
                    <div>
                      <div className="inv-detail-label">Table No</div>
                      <div className="inv-detail-value">{invoice.reservedTableInfo.tableNumber}</div>
                    </div>
                  </div>

                  <div className="inv-detail-item">
                    <div className="inv-detail-icon">
                      <FaClock />
                    </div>
                    <div>
                      <div className="inv-detail-label">Time Slot</div>
                      <div className="inv-detail-value">{invoice.reservedTableInfo.slotTime}</div>
                    </div>
                  </div>

                  <div className="inv-detail-item">
                    <div className="inv-detail-icon">
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <div className="inv-detail-label">Date</div>
                      <div className="inv-detail-value">
                        {new Date(invoice.reservedTableInfo.date).toLocaleDateString("en-US", {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="inv-detail-item">
                    <div className="inv-detail-icon">
                      <FaMoneyBillWave />
                    </div>
                    <div>
                      <div className="inv-detail-label">Reservation Fee</div>
                      <div className="inv-detail-value">₹100 (included in total)</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="inv-detail-actions">
            <button
              type="button"
              onClick={printInvoice}
              className="inv-detail-action-btn inv-detail-print-btn"
              disabled={loading}
            >
              Print Invoice
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserInvoiceDetail;
