const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: false // Make password optional for OAuth users
  },
  googleId: {
    type: String,
    required: false
  },
  role: { 
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  otp: {
    type: String,
    required: false
  },
  otpExpiry: {
    type: String, // Change to Date type for accurate comparison
    required: false
  },
  contact: { 
    type: String,
    required: false
  },
  // Add the selectedFoods field to store food items the user has selected
  selectedFoods: [
    {
      food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
      },
      quantity: {
        type: Number,
        default: 1
      },
      price: {
        type: Number
      },
      name: {
        type: String
      },
      date : {
        type: Date,
        default: Date.now
      }
    }
  ],
  payments: [
    {
      paymentIntentId: String,
      amount: Number,
      currency: String,
      status: String,
      reservationId: mongoose.Schema.Types.ObjectId, // Add this field
      tableNumber: Number, // Add tableNumber
      slotTime: String, // Add slotTime
      deducted: { type: Boolean, default: false }, // Track if ₹100 is deducted
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
