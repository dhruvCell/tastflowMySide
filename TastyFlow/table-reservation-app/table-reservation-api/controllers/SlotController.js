const Slot = require('../models/Slot');
const User = require('../models/User');
const nodemailer = require('nodemailer');
require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const getSlotTime = (slotNumber) => {
  const slotTimes = {
    1: '5:00 PM to 7:00 PM',
    2: '7:00 PM to 9:00 PM',
    3: '9:00 PM to 11:00 PM'
  };
  return slotTimes[slotNumber] || 'Unknown time range';
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
}
});

// Get all slots for a specific slot number
const getAllSlots = async (req, res) => {
  try {
    const slotNumber = parseInt(req.params.slotNumber);
    const slots = await Slot.find({ slotNumber }).populate({
      path: 'reservedBy',
      select: 'name contact email'
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'inr',
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reserveSlot = async (req, res) => {
  try {
    const { number, paymentIntentId } = req.body;
    const userId = req.user.id;
    const slotNumber = parseInt(req.params.slotNumber);

    const slot = await Slot.findOne({ slotNumber, number });
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (slot.reserved) return res.status(400).json({ message: "Slot is already reserved" });
    if (slot.disabled) return res.status(400).json({ message: "Slot is currently disabled" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    slot.reserved = true;
    slot.reservedBy = userId;
    await slot.save();

    const paymentData = {
      paymentIntentId,
      amount: 100,
      currency: "inr",
      status: "succeeded",
      tableNumber: number,
      slotTime: getSlotTime(slotNumber),
      reservationId: slot._id,
      deducted: false
    };

    user.payments.push(paymentData);
    await user.save();

    // === Send email to user ===
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Reservation Confirmation – TastyFlow",
      text: `Dear ${user.name || "Valued Guest"},
    
We are delighted to confirm your reservation with TastyFlow. Please find your booking details below:

📅 Reservation Details:
- Table Number: ${slot.number}
- Time Slot: ${getSlotTime(slotNumber)}

We kindly request you to arrive 10–15 minutes before your scheduled time to ensure a smooth seating experience.  
If you have any special requests or require changes to your booking, feel free to reach out to us at ${process.env.EMAIL}.

Thank you for choosing TastyFlow. We look forward to serving you a memorable dining experience!

Warm regards,  
The TastyFlow Team`
    });

    // === Send email to admin ===
    await transporter.sendMail({
      from: process.env.EMAIL, // show user as sender
      to: process.env.EMAIL,
      subject: "New Reservation – TastyFlow",
      html: `
        <h3>Admin,</h3>
        <p>User <b>${user.name}</b> (${user.email}) has made a reservation.</p>
        <p><b>Table:</b> ${slot.number}</p>
        <p><b>Slot:</b> ${getSlotTime(slotNumber)}</p>
        <p><b>Reservation ID:</b> ${slot._id}</p>
      `
    });

    const populatedSlot = await Slot.findById(slot._id).populate({
      path: 'reservedBy',
      select: 'name contact'
    });

    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('slotUpdated', {
      action: 'reserved',
      slotNumber,
      tableNumber: number,
      reservedBy: {
        _id: user._id,
        name: user.name,
        contact: user.contact
      },
      slot: populatedSlot
    });

    io.to(`user_${userId}`).emit('newReservation', {
      reservation: {
        reservationId: slot._id,
        tableNumber: number,
        slotTime: getSlotTime(slotNumber)
      }
    });

    res.status(200).json({
      message: "Slot reserved successfully",
      slot: populatedSlot
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const unreserveSlot = async (req, res) => {
  try {
    const { number } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const slotNumber = parseInt(req.params.slotNumber);
    const user = await User.findById(userId);
    const slot = await Slot.findOne({ slotNumber, number });
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (userRole !== "admin" && (!slot.reserved || String(slot.reservedBy) !== String(userId))) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const reservedByUser = await User.findById(slot.reservedBy);
    if (reservedByUser) {
      // Update the payment record to mark as deducted
      reservedByUser.payments = reservedByUser.payments.map(payment => {
        if (String(payment.reservationId) === String(slot._id)) {
          return { ...payment, deducted: true };
        }
        return payment;
      });
      await reservedByUser.save();
    }

    slot.reserved = false;
    slot.reservedBy = null;
    await slot.save();

    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('slotUpdated', { 
      action: 'unreserved', 
      slotNumber, 
      tableNumber: number,
      slot: slot
    });

    // Emit event to update reservations dropdown
    io.to(`user_${userId}`).emit('reservationRemoved', {
      reservationId: slot._id
    });

    // --- Email Notification ---
    if (reservedByUser) {
      

      // 📩 Notify the USER
      const userMailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Reservation Cancellation Confirmation – TastyFlow",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #fafafa;">
            <h2 style="color: #ff6b6b; text-align: center;">Reservation Cancelled</h2>
            <p>Dear ${reservedByUser.name || "Guest"},</p>
            <p>This is to confirm that your reservation has been successfully <strong>cancelled</strong> as per your request.</p>
            <h3>Cancelled Reservation Details</h3>
            <ul>
              <li><strong>Table:</strong> ${number}</li>
              <li><strong>Time Slot:</strong> ${getSlotTime(slotNumber)}</li>
            </ul>
            <p>You may book another table anytime using our reservation system. If you need help, contact us at tastyflow01@gmail.com.</p>
            <p>Warm regards,<br><strong>The TastyFlow Team</strong></p>
          </div>
        `
      };

      // 📩 Notify the ADMIN
      const adminMailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL, // admin email
        subject: `User Cancelled Reservation – Table ${number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #fafafa;">
            <h2 style="color: #ff6b6b; text-align: center;">Reservation Cancelled by User</h2>
            <p><strong>User:</strong> ${reservedByUser.name || "Unknown"} (${reservedByUser.email})</p>
            <h3>Cancelled Reservation Details</h3>
            <ul>
              <li><strong>Table:</strong> ${number}</li>
              <li><strong>Time Slot:</strong> ${getSlotTime(slotNumber)}</li>
            </ul>
            <p>This reservation was <strong>cancelled directly by the user</strong>. Please verify payment adjustments in the system if necessary.</p>
            <p>Best regards,<br><strong>TastyFlow System</strong></p>
          </div>
        `
      };

      await transporter.sendMail(userMailOptions);
      await transporter.sendMail(adminMailOptions);
    }

    res.status(200).json({ message: "Slot unreserved successfully", slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const adminUnreserveSlot = async (req, res) => {
  try {
    const { number } = req.body;
    const userRole = req.user.role;
    const slotNumber = parseInt(req.params.slotNumber);

    const slot = await Slot.findOne({ slotNumber, number });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    const reservedByUser = await User.findById(slot.reservedBy);
    if (reservedByUser) {
      // Mark payment as deducted
      reservedByUser.payments = reservedByUser.payments.map(payment => {
        if (String(payment.reservationId) === String(slot._id)) {
          return { ...payment, deducted: true };
        }
        return payment;
      });
      await reservedByUser.save();
    }

    slot.reserved = false;
    slot.reservedBy = null;
    await slot.save();

    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('slotUpdated', { 
      action: 'adminUnreserved', 
      slotNumber, 
      tableNumber: number,
      slot: slot
    });

    // Notify user socket
    if (reservedByUser) {
      io.to(`user_${reservedByUser._id}`).emit('reservationRemoved', {
        reservationId: slot._id
      });

      const mailOptions = {
        from: "tastyflow01@gmail.com",
        to: reservedByUser.email,
        subject: "Reservation Cancellation – TastyFlow (Admin Assisted)",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #fafafa;">
            <h2 style="color: #ff6b6b; text-align: center;">Reservation Cancelled</h2>
            <p style="font-size: 16px; color: #333;">Dear ${reservedByUser.name || "Guest"},</p>
            
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              We would like to inform you that your reservation has been <strong>cancelled by our administrator</strong>.
            </p>

            <h3 style="color: #333; margin-top: 20px;">Cancelled Reservation Details</h3>
            <ul style="font-size: 15px; color: #555; line-height: 1.6;">
              <li><strong>Table:</strong> ${number}</li>
              <li><strong>Time Slot:</strong> ${getSlotTime(slotNumber)}</li>
            </ul>

            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              Please note that any applicable payment adjustment has been marked in your account.  
              If you wish to make a new reservation, kindly visit our website or contact us directly.
            </p>

            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              For any questions or further assistance, you may reach us at 
              <a href="mailto:tastyflow01@gmail.com" style="color: #ff6b6b; text-decoration: none;">tastyflow01@gmail.com</a> 
              or call <strong>+91 1234567890</strong>.
            </p>

            <p style="margin-top: 30px; font-size: 15px; color: #333;">Warm regards,</p>
            <p style="font-size: 16px; font-weight: bold; color: #ff6b6b;">The TastyFlow Team</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({ message: 'Slot unreserved by admin successfully', slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addSlot = async (req, res) => {
  try {
    const { number, capacity } = req.body;
    const slotNumber = parseInt(req.params.slotNumber);
    
    const newSlot = new Slot({ 
      slotNumber,
      number, 
      capacity 
    });
    
    await newSlot.save();

    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('tableAdded', {
      slotNumber,
      table: newSlot
    });

    res.status(201).json(newSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSlot = async (req, res) => {
  try {
    const { number } = req.body;
    const slotNumber = parseInt(req.params.slotNumber);
    const slot = await Slot.findOneAndDelete({ slotNumber, number });

    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('tableDeleted', {
      slotNumber,
      tableNumber: number
    });

    res.json({ message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleTableStatus = async (req, res) => {
  try {
    const { number } = req.body;
    const slotNumber = parseInt(req.params.slotNumber);

    const slot = await Slot.findOne({ slotNumber, number });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    slot.disabled = !slot.disabled;
    await slot.save();

    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('slotUpdated', { 
      action: slot.disabled ? 'tableDisabled' : 'tableEnabled',
      slotNumber,
      tableNumber: number,
      slot: slot
    });

    // Emit to foodUpdates room for user interface
    io.to('foodUpdates').emit('tableStatusChanged', {
      slotNumber,
      tableNumber: number,
      disabled: slot.disabled
    });

    res.status(200).json({ 
      message: `Table ${slot.disabled ? 'disabled' : 'enabled'} successfully`,
      slot
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const changeTable = async (req, res) => {
  try {
    const { oldTableNumber, newTableNumber } = req.body;
    const slotNumber = parseInt(req.params.slotNumber);

    // Get the old table
    const oldTable = await Slot.findOne({ slotNumber, number: oldTableNumber });
    if (!oldTable) return res.status(404).json({ message: 'Old table not found' });
    if (!oldTable.reserved) return res.status(400).json({ message: 'Old table is not reserved' });

    // Get the new table
    const newTable = await Slot.findOne({ slotNumber, number: newTableNumber });
    if (!newTable) return res.status(404).json({ message: 'New table not found' });
    if (newTable.reserved) return res.status(400).json({ message: 'New table is already reserved' });
    if (newTable.disabled) return res.status(400).json({ message: 'New table is disabled' });
    if (newTable.capacity !== oldTable.capacity) {
      return res.status(400).json({ message: 'Tables must have the same capacity' });
    }

    // Get the user who reserved the old table
    const user = await User.findById(oldTable.reservedBy);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update the payment record with the new table number
    user.payments = user.payments.map(payment => {
      if (String(payment.reservationId) === String(oldTable._id)) {
        return { ...payment, tableNumber: newTableNumber };
      }
      return payment;
    });
    await user.save();

    // Reserve the new table
    newTable.reserved = true;
    newTable.reservedBy = oldTable.reservedBy;
    await newTable.save();

    // Unreserve the old table
    oldTable.reserved = false;
    oldTable.reservedBy = null;
    await oldTable.save();

    const io = req.app.get('io');

    // Emit events for both tables
    io.to(`slot_${slotNumber}`).emit('tableChanged', {
      slotNumber,
      oldTableNumber,
      newTableNumber,
      reservedBy: {
        _id: user._id,
        name: user.name,
        contact: user.contact
      }
    });

    // Emit event to update user's reservation
    io.to(`user_${user._id}`).emit('reservationChanged', {
      oldReservationId: oldTable._id,
      newReservation: {
        reservationId: newTable._id,
        tableNumber: newTable.number,
        slotTime: getSlotTime(slotNumber)
      }
    });

    // Send email notification to user
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Reservation Update – Your Table Has Been Changed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #fafafa;">
          <h2 style="color: #ff6b6b; text-align: center;">Reservation Update</h2>
          <p style="font-size: 16px; color: #333;">Dear ${user.name || "Valued Guest"},</p>
          
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            We would like to inform you that your reservation has been modified by our restaurant administrator to better accommodate your dining experience. Please review the updated details below:
          </p>
    
          <h3 style="color: #333; margin-top: 20px;">Original Reservation</h3>
          <ul style="font-size: 15px; color: #555; line-height: 1.6;">
            <li><strong>Table:</strong> ${oldTableNumber}</li>
            <li><strong>Time Slot:</strong> ${getSlotTime(slotNumber)}</li>
          </ul>
    
          <h3 style="color: #333; margin-top: 20px;">New Reservation</h3>
          <ul style="font-size: 15px; color: #555; line-height: 1.6;">
            <li><strong>Table:</strong> ${newTableNumber}</li>
            <li><strong>Time Slot:</strong> ${getSlotTime(slotNumber)}</li>
          </ul>
    
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            If you have any questions, special requests, or need further assistance, please feel free to reach us at 
            <a href="mailto:tastyflow01@gmail.com" style="color: #ff6b6b; text-decoration: none;">tastyflow01@gmail.com</a> 
            or call us directly at <strong>+91 1234567890</strong>.
          </p>
    
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Thank you for choosing <strong>TastyFlow</strong>. We look forward to serving you and ensuring an exceptional dining experience.
          </p>
    
          <p style="margin-top: 30px; font-size: 15px; color: #333;">Warm regards,</p>
          <p style="font-size: 16px; font-weight: bold; color: #ff6b6b;">The TastyFlow Team</p>
        </div>
      `
    };
    

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        // console.log('Email sent:', info.response);
      }
    });

    res.status(200).json({ 
      message: 'Table changed successfully',
      oldTable,
      newTable
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvailableTables = async (req, res) => {
  try {
    const { capacity, exclude } = req.query;
    const slotNumber = parseInt(req.params.slotNumber);
    
    const query = { 
      slotNumber,
      capacity: parseInt(capacity),
      reserved: false,
      disabled: false
    };
    
    if (exclude) {
      query.number = { $ne: parseInt(exclude) };
    }

    const tables = await Slot.find(query).sort('number');
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminReserveSlot = async (req, res) => {
  try {
    const { number, userId } = req.body;
    const slotNumber = parseInt(req.params.slotNumber);

    const slot = await Slot.findOne({ slotNumber, number });
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (slot.reserved) return res.status(400).json({ message: "Slot is already reserved" });
    if (slot.disabled) return res.status(400).json({ message: "Slot is currently disabled" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    slot.reserved = true;
    slot.reservedBy = userId;
    await slot.save();

    const paymentData = {
      paymentIntentId: 'admin-assisted',
      amount: 100,
      currency: "inr",
      status: "admin-assisted",
      tableNumber: number,
      slotTime: getSlotTime(slotNumber),
      reservationId: slot._id,
      deducted: false
    };

    user.payments.push(paymentData);
    await user.save();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Reservation Confirmation – Assisted by Admin",
      text: `Dear ${user.name || "Valued Guest"},
    
    We are pleased to inform you that your reservation at TastyFlow has been successfully confirmed by our administrator.  
    
    📅 Reservation Details:
    - Table Number: ${slot.number}
    - Time Slot: ${getSlotTime(slotNumber)}
    
    Our team looks forward to hosting you and ensuring you have a delightful dining experience. Please arrive 10–15 minutes prior to your reservation time to allow for a smooth seating process.  
    Should you have any special requests or require further assistance, feel free to contact us at tastyflow01@gmail.com.  
    Thank you for choosing TastyFlow. We are excited to serve you and make your visit memorable.  
    
    Warm regards,  
    The TastyFlow Team
    `
    };    
    transporter.sendMail(mailOptions);

    const populatedSlot = await Slot.findById(slot._id).populate({
      path: 'reservedBy',
      select: 'name contact'
    });

    const io = req.app.get('io');
    io.to(`slot_${slotNumber}`).emit('slotUpdated', { 
      action: 'reserved', 
      slotNumber, 
      tableNumber: number,
      reservedBy: {
        _id: user._id,
        name: user.name,
        contact: user.contact
      },
      slot: populatedSlot
    });

    // Emit new reservation to user's room
    io.to(`user_${userId}`).emit('newReservation', {
      reservation: {
        reservationId: slot._id,
        tableNumber: number,
        slotTime: getSlotTime(slotNumber)
      }
    });

    res.status(200).json({ 
      message: "Slot reserved successfully by admin", 
      slot: populatedSlot 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllSlots,
  reserveSlot,
  unreserveSlot,
  adminUnreserveSlot,
  addSlot,
  deleteSlot,
  createPaymentIntent,
  toggleTableStatus,
  changeTable,
  getAvailableTables,
  adminReserveSlot
};
