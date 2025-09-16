import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { FaArrowLeft } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar/Sidebar';
import "./UserInvoices.css";

const UserInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUserInvoices = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/invoice/user/invoices', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token'),
                },
            });

            const data = await response.json();

            if (response.ok) {
                setInvoices(data);
            } else {
                message.error(data.message || 'Failed to load invoices');
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
            message.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInvoices();
    }, []);

    const navigateToInvoiceDetail = (invoiceId) => {
        navigate(`/user/${invoiceId}`);
    };

    const goBack = () => {
        navigate(-1);
    };

    const downloadInvoicePDF = async (invoiceId) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/invoice/admin/${invoiceId}/download-pdf`,
                {
                    method: 'GET',
                    headers: {
                        'auth-token': localStorage.getItem('token'),
                    },
                }
            );

            if (response.ok) {
                const blob = new Blob([await response.blob()], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Invoice_${invoiceId}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                message.success('Invoice PDF downloaded successfully');
            } else {
                message.error('Failed to download invoice PDF');
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            message.error('Failed to download invoice PDF');
        }
    };

    const calculateDueAmount = (invoice) => {
        if (!invoice) return 0;
        const totalPaid = invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        const amount = invoice.finalAmount || invoice.totalAmount || 0;
        return Math.max(0, amount - totalPaid);
    };

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

    return (
        <div className="user-invoices-container">
            <main className="user-invoices-content">
                <header className="user-invoices-header">
                    <div className="user-invoices-header-top">
                        <button onClick={goBack} className="user-invoices-back-btn">
                            <FaArrowLeft /> Back
                        </button>
                        <h1>My Invoices</h1>
                    </div>
                    <p className="user-invoices-subtitle">View and manage your invoices</p>
                </header>

                {loading ? (
                    <div className="user-invoices-loading">Loading your invoices...</div>
                ) : (
                    <div className="user-invoices-view">
                        <div className="user-invoices-table-container">
                            <div className="user-invoices-table-header">
                                <div className="user-invoices-header-item">
                                    <span>DATE</span>
                                </div>
                                <div className="user-invoices-header-item">
                                    <span>STATUS</span>
                                </div>
                                <div className="user-invoices-header-item">
                                    <span>AMOUNT</span>
                                </div>
                                <div className="user-invoices-header-item">
                                    <span>DUE</span>
                                </div>
                                <div className="user-invoices-header-item" style={{"textAlign": "center"}}>
                                    <span>ACTIONS</span>
                                </div>
                            </div>

                            {invoices.length > 0 ? (
                                invoices.map((invoice) => (
                                    <div key={invoice._id} className="user-invoices-table-row">
                                        <div className="user-invoices-row-item">
                                            <span>{new Date(invoice.invoiceDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}</span>
                                        </div>
                                        <div className="user-invoices-row-item">
                                            <StatusBadge status={invoice.status} dueDate={invoice.dueDate} />
                                        </div>
                                        <div className="user-invoices-row-item amount">
                                            <span>₹{(invoice.finalAmount || invoice.totalAmount || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="user-invoices-row-item amount">
                                            <span style={{
                                                color: calculateDueAmount(invoice) > 0 ? '#F44336' : '#4CAF50',
                                                fontWeight: calculateDueAmount(invoice) > 0 ? '600' : 'normal'
                                            }}>
                                                ₹{calculateDueAmount(invoice).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="user-invoices-row-item actions">
                                            <div className="action-buttons-container">
                                                <div className="action-buttons-grid">
                                                    <button
                                                        onClick={() => navigateToInvoiceDetail(invoice._id)}
                                                        className="user-invoices-view-btn"
                                                    >
                                                        Details
                                                    </button>
                                                    <button
                                                        onClick={() => downloadInvoicePDF(invoice._id)}
                                                        className="user-invoices-pdf-btn"
                                                    >
                                                        Download PDF
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="user-invoices-empty-state">
                                    No invoices found.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserInvoices;
