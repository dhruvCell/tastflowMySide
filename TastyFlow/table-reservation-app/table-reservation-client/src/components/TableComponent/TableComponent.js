import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useSocket } from '../../context/SocketContext';
import PaymentForm from '../../components/PaymentForm/PaymentForm';
import CustomSpinner from '../CustomSpinner/CustomSpinner';
import './TableComponent.css';
import { toast } from 'react-toastify';
import { Howl } from 'howler';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_CLIENT_KEY);


const reserveSound = new Howl({ src: ['/sounds/submit.mp3'] });
const unreserveSound = new Howl({ src: ['/sounds/submit.mp3'] });

const TableComponent = ({ showAlert }) => {
  const [tables, setTables] = useState([]);
  const [userId, setUserId] = useState('');
  const [loadingTable, setLoadingTable] = useState(null);
  const [capacityFilter, setCapacityFilter] = useState('');
  const [slotFilter, setSlotFilter] = useState('1');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [selectedTableNumber, setSelectedTableNumber] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    fetchUserDetails();
    fetchTables();
    
    if (socket) {
      socket.emit('joinRoom', `slot_${slotFilter}`);
      socket.on('slotUpdated', handleSlotUpdate);
      socket.on('tableAdded', handleTableAdded);
      socket.on('tableDeleted', handleTableDeleted);
      socket.on('tableStatusChanged', handleTableStatusChanged);
      
      return () => {
        socket.off('slotUpdated', handleSlotUpdate);
        socket.off('tableAdded', handleTableAdded);
        socket.off('tableDeleted', handleTableDeleted);
        socket.off('tableStatusChanged', handleTableStatusChanged);
        socket.emit('leaveRoom', `slot_${slotFilter}`);
      };
    }
  }, [socket, slotFilter]);

  const handleTableStatusChanged = (data) => {
    if (data.slotNumber.toString() === slotFilter) {
      setTables(prevTables => {
        // Remove the table if it's disabled, add it back if enabled
        if (data.disabled) {
          return prevTables.filter(table => table.number !== data.tableNumber);
        } else {
          // Check if table already exists
          const exists = prevTables.some(table => table.number === data.tableNumber);
          if (!exists) {
            // Fetch the newly enabled table
            fetchSingleTable(data.tableNumber);
          }
          return prevTables;
        }
      });
    }
  };

  const fetchSingleTable = async (tableNumber) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/slot/${slotFilter}`);
      const table = response.data.find(t => t.number === tableNumber);
      if (table && !table.disabled) {
        setTables(prevTables => {
          const exists = prevTables.some(t => t.number === tableNumber);
          if (!exists) {
            return [...prevTables, table].sort((a, b) => a.number - b.number);
          }
          return prevTables;
        });
      }
    } catch (error) {
      console.error('Error fetching single table:', error);
    }
  };

  const handleSlotUpdate = (data) => {
    if (data.slotNumber.toString() === slotFilter) {
      setTables(prevTables => {
        // Don't show disabled tables
        if (data.slot?.disabled) {
          return prevTables.filter(table => table.number !== data.tableNumber);
        }
        
        return prevTables.map(table => {
          if (table.number === data.tableNumber) {
            return {
              ...table,
              reserved: data.action === 'reserved',
              reservedBy: data.reservedBy || null
            };
          }
          return table;
        });
      });
    }
  };

  const handleTableAdded = (data) => {
    if (data.slotNumber.toString() === slotFilter && !data.table.disabled) {
      setTables(prevTables => [...prevTables, data.table].sort((a, b) => a.number - b.number));
    }
  };
  
  const handleTableDeleted = (data) => {
    if (data.slotNumber.toString() === slotFilter) {
      setTables(prevTables => prevTables.filter(table => table.number !== data.tableNumber));
    }
  };

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        'http://localhost:5000/api/users/getuser',
        {},
        { headers: { 'auth-token': token } }
      );
      setUserId(response.data._id);
    } catch (error) {
      console.error('Error fetching user details:', error);
      showAlert('Error fetching user details', 'danger');
    }
  };

  const fetchTables = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/slot/${slotFilter}`);
      // Filter out disabled tables from the initial fetch
      setTables(response.data.filter(table => !table.disabled));
    } catch (error) {
      console.error('Error fetching tables:', error);
      showAlert('Error fetching tables', 'danger');
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    showAlert('Payment successful!', 'success');
    setPaymentIntent(paymentIntent);
    setShowPaymentForm(false);

    try {
      await axios.post(
        `http://localhost:5000/api/slot/${selectedSlot}/reserve`,
        { 
          number: selectedTableNumber,
          paymentIntentId: paymentIntent.id,
        },
        { headers: { 'auth-token': localStorage.getItem('token') } }
      );
      reserveSound.play();
      showAlert('Table reserved successfully', 'success');
    } catch (error) {
      console.error('Error reserving table:', error);
      showAlert('Error reserving table', 'danger');
    }
  };

  const handlePaymentError = (error) => {
    showAlert(`Payment failed: ${error}`, 'danger');
    setShowPaymentForm(false);
  };

  const toggleReservation = async (number, isReserved, reservedBy) => {
    if (isReserved && reservedBy !== userId) {
      showAlert('You do not have permission to unreserve this table', 'danger');
      return;
    }
  
    setLoadingTable(number);
    setSelectedSlot(slotFilter);
  
    if (!isReserved) {
      setSelectedTableNumber(number);
      const token = localStorage.getItem('token');
      if (!token) return;
  
      try {
        const { data } = await axios.post(
          `http://localhost:5000/api/slot/${slotFilter}/create-payment-intent`,
          { amount: 100 },
          { headers: { 'auth-token': token } }
        );
        setPaymentIntent({ clientSecret: data.clientSecret, tableNumber: number });
        setShowPaymentForm(true);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        showAlert('Error creating payment intent', 'danger');
      } finally {
        setLoadingTable(null);
      }
    } else {
      try {
        await axios.post(
          `http://localhost:5000/api/slot/${slotFilter}/unreserve`,
          { number },
          { headers: { 'auth-token': localStorage.getItem('token') } }
        );
        unreserveSound.play();
        showAlert('Table unreserved successfully', 'success');
      } catch (error) {
        console.error('Error unreserving table:', error);
        showAlert('Error unreserving table', 'danger');
      } finally {
        setLoadingTable(null);
      }
    }
  };

  const sortedTables = [...tables].sort((a, b) => a.number - b.number);
  const filteredTables = sortedTables.filter(table => 
    (!capacityFilter || table.capacity === parseInt(capacityFilter))
  );

  return (
    <div className="table-container">
      <div className="container">
        <div className="table-heading">
          <h1 className="header">Reserve Your Table</h1>
        </div>

        <div className="filter-indicator-container">
          <div className="slot-filter">
            <label htmlFor="slot">Filter by Slot: </label>
            <select
              id="slot"
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
            >
              <option value="1">5:00 TO 7:00</option>
              <option value="2">7:00 TO 9:00</option>
              <option value="3">9:00 TO 11:00</option>
            </select>
          </div>

          <div className="capacity-filter">
            <label htmlFor="capacity">Filter by Capacity: </label>
            <select
              id="capacity"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
            >
              <option value="">All Capacities</option>
              <option value="2">2 People</option>
              <option value="4">4 People</option>
              <option value="6">6 People</option>
            </select>
          </div>

          <div className="indicator">
            <div className="indicator-item">
              <div className="grey"></div>
              <span>Un-Reserved</span>
            </div>
            <div className="indicator-item">
              <div className="red"></div>
              <span>Reserved</span>
            </div>
          </div>
        </div>

        <div className="table-button-container">
          {filteredTables.map((table) => (
            <div key={table.number} className="table-button">
              <button
                onClick={() => toggleReservation(table.number, table.reserved, table.reservedBy?._id)}
                className={`table-button-button ${
                  table.reserved ? 'reserved' : ''
                } ${loadingTable === table.number ? 'loading' : ''}`}
                disabled={
                  loadingTable === table.number ||
                  (table.reserved && table.reservedBy?._id !== userId)
                }
              >
                {loadingTable === table.number ? <CustomSpinner /> : `Table ${table.number}`}
              </button>

              {table.reserved && (
                <div className="table-button-reserved">Reserved</div>
              )}
            </div>
          ))}
        </div>

        {showPaymentForm && (
          <Elements stripe={stripePromise}>
            <PaymentForm
              clientSecret={paymentIntent?.clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              tableNumber={selectedTableNumber}
              slot={selectedSlot}
              amount={100}
              onClose={() => setShowPaymentForm(false)}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default TableComponent;