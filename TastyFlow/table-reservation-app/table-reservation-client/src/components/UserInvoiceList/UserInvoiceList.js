import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import { toast } from 'react-toastify';
import axios from 'axios';
import './UserInvoiceList.css';
import { FaUser, FaCalendarAlt, FaTable, FaClock, FaMoneyBillWave, FaEnvelope, FaPhone, FaIdCard } from 'react-icons/fa';
import generatePrintInvoiceHTML from '../../utils/printInvoice';

const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const [state, setState] = useState({
    invoice: null,
    loading: true,
    error: null,
    isSending: false
  });

  useEffect(() => {
    const fetchInvoiceDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/invoice/admin/${invoiceId}`);
        setState(prev => ({
          ...prev,
          invoice: response.data,
          loading: false
        }));
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load invoice details.'
        }));
      }
    };

    fetchInvoiceDetail();
  }, [invoiceId]);

  const sendInvoice = async () => {
    try {
      setState(prev => ({ ...prev, isSending: true }));
      const response = await axios.post(
        `http://localhost:5000/api/users/send-invoice/${invoiceId}`,
        { userId: state.invoice.userId._id }
      );
      toast.success('Invoice sent successfully!');
      setState(prev => ({ ...prev, isSending: false }));
    } catch (error) {
      toast.error('Error sending invoice');
      console.error(error);
      setState(prev => ({ ...prev, isSending: false }));
    }
  };

  const printInvoice = () => {
    const printWindow = window.open('', '', 'height=800,width=1200');
    const invoiceHTML = generatePrintInvoiceHTML(state.invoice);

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };

  if (state.loading) return <div className="inv-detail-loading">Loading invoice...</div>;
  if (state.error) return <div className="inv-detail-error">{state.error}</div>;

  return (
    <div className="inv-detail-container">
      <Sidebar />
      
      <main className="inv-detail-content">
        <header className="inv-detail-header">
          <h1>Invoice Details</h1>
          <div className="inv-detail-meta">
            <span>Invoice: {state.invoice.invoiceNumber}</span>
            <span>Date: {state.invoice.invoiceDate ? new Date(state.invoice.invoiceDate).toLocaleDateString() : ''}</span>
            {state.invoice.reservedTableInfo && (
              <div className="ei-table-reservation">
                <span>Table {state.invoice.reservedTableInfo.tableNumber}</span> -
                <span> [{state.invoice.reservedTableInfo.slotTime}]</span>
              </div>
            )}
          </div>
          
        </header>

        <div className="inv-detail-view">
          <section className="inv-detail-summary">
            <div className="inv-detail-summary-grid">
              <div className="inv-detail-summary-item">
                <label>Total Amount</label>
                <p>₹{state.invoice.totalAmount.toFixed(2)}</p>
              </div>
              <div className="inv-detail-summary-item inv-detail-discount">
                <label>Discount</label>
                <p>-₹{state.invoice.discount.toFixed(2)}</p>
              </div>
              
              <div className="inv-detail-summary-item">
                <label>CGST (2.5%)</label>
                <p>₹{state.invoice.cgst.toFixed(2)}</p>
              </div>
              
              <div className="inv-detail-summary-item">
                <label>SGST (2.5%)</label>
                <p>₹{state.invoice.sgst.toFixed(2)}</p>
              </div>
              
              <div className="inv-detail-summary-item">
                <label>Round Off</label>
                <p>₹{state.invoice.roundOff.toFixed(2)}</p>
              </div>

              {state.invoice.reservedTableInfo && (
                <div className="inv-detail-summary-item inv-detail-discount">
                  <label>Table Reservation</label>
                  <p>-₹100.00</p>
                </div>
              )}
              <div className="inv-detail-summary-item inv-detail-total">
                <label>Final Amount</label>
                <p>₹
  {(state.invoice.finalAmount || state.invoice.totalAmount).toFixed(2)}
</p>
              </div>
            </div>
          </section>

          <section className="inv-detail-user-section">
            <h2 className="inv-detail-section-title">
              Customer Information
            </h2>
            <div className="inv-detail-card">
              <div className="inv-detail-grid">
                <div className="inv-detail-item">
                  <div className="inv-detail-icon">
                    <FaUser />
                  </div>
                  <div>
                    <div className="inv-detail-label">Name</div>
                    <div className="inv-detail-value">{state.invoice.userId.name}</div>
                  </div>
                </div>
                
                <div className="inv-detail-item">
                  <div className="inv-detail-icon">
                    <FaEnvelope />
                  </div>
                  <div>
                    <div className="inv-detail-label">Email</div>
                    <div className="inv-detail-value">{state.invoice.userId.email}</div>
                  </div>
                </div>
                
                <div className="inv-detail-item">
                  <div className="inv-detail-icon">
                    <FaPhone />
                  </div>
                  <div>
                    <div className="inv-detail-label">Contact</div>
                    <div className="inv-detail-value">{state.invoice.userId.contact}</div>
                  </div>
                </div>
                
                <div className="inv-detail-item">
                  <div className="inv-detail-icon">
                    <FaIdCard />
                  </div>
                  <div>
                    <div className="inv-detail-label">User ID</div>
                    <div className="inv-detail-value inv-detail-user-id">{state.invoice.userId._id}</div>
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
              
              {state.invoice.foods.length > 0 ? (
                state.invoice.foods.map((food, index) => (
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

          {state.invoice.reservedTableInfo && (
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
                      <div className="inv-detail-value">{state.invoice.reservedTableInfo.tableNumber}</div>
                    </div>
                  </div>
                  
                  <div className="inv-detail-item">
                    <div className="inv-detail-icon">
                      <FaClock />
                    </div>
                    <div>
                      <div className="inv-detail-label">Time Slot</div>
                      <div className="inv-detail-value">{state.invoice.reservedTableInfo.slotTime}</div>
                    </div>
                  </div>
                  
                  <div className="inv-detail-item">
                    <div className="inv-detail-icon">
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <div className="inv-detail-label">Date</div>
                      <div className="inv-detail-value">
                        {new Date(state.invoice.reservedTableInfo.date).toLocaleDateString("en-US", {
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
              disabled={state.loading || state.error}
            >
              Print Invoice
            </button>
            <button
              type="button"
              onClick={sendInvoice}
              className="inv-detail-action-btn inv-detail-send-btn"
              disabled={state.isSending || state.loading || state.error}
            >
              {state.isSending ? (
                <span className="inv-detail-loader">
                  <span className="inv-detail-loader-dot"></span>
                  <span className="inv-detail-loader-dot"></span>
                  <span className="inv-detail-loader-dot"></span>
                </span>
              ) : (
                'Send Invoice'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvoiceDetail;