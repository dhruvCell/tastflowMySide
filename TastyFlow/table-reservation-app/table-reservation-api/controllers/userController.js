const User = require('../models/User');
const Food = require('../models/FoodModel');  // Import Food model
const Invoice = require('../models/Invoice');  // Import Invoice model
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { toWords } = require('number-to-words');
const { generateInvoiceEmailHTML } = require('../utils/emailTemplates');

// Google OAuth login handler
const googleAuth = async (req, res) => {
    try {
        const user = req.user; // User from Passport
        let data;
        if (user.isTemp) {
            // Temporary user, store profile info in token
            data = {
                tempUser: {
                    googleId: user.googleId,
                    name: user.name,
                    email: user.email,
                }
            };
        } else {
            // Existing user
            data = {
                user: {
                    id: user.id,
                }
            };
        }
        const authtoken = jwt.sign(data, process.env.JWT_SECRET);
        res.redirect(`http://localhost:3000/auth/callback?token=${authtoken}`);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
};

// Create a User
const createUser = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Sorry, a user with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
            contact: req.body.contact,
        });

        const data = {
            user: {
                id: user.id,
            }
        };

        const authtoken = jwt.sign(data, process.env.JWT_SECRET);
        success = true;
        res.json({ success, authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
};

// Authenticate a User
const loginUser = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        // Check if user was created via OAuth (has googleId but no password)
        if (user.googleId && !user.password) {
            return res.status(400).json({
                error: "This account was created using Google login. Please use 'Continue with Google' to sign in."
            });
        }

        // Check if user has a password (for regular registration)
        if (!user.password) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }
        const data = { user: { id: user.id, role: user.role } };
        const authtoken = jwt.sign(data, process.env.JWT_SECRET);
        success = true;
        res.json({ success, authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
};

// Get User Details
const getUser = async (req, res) => {
    try {
        let user;
        if (req.user.id) {
            // Existing user
            user = await User.findById(req.user.id).select("-password");
        } else if (req.user.googleId) {
            // Temp user from OAuth
            user = {
                _id: null,
                name: req.user.name,
                email: req.user.email,
                googleId: req.user.googleId,
                contact: '', // No contact yet
                // Add other fields as needed
            };
        } else {
            return res.status(400).json({ error: "Invalid user data" });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
};

// Fetch all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude passwords
        res.json(users);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
};

// Add this route to fetch user details by ID
const getUserId = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  };
  

// Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is registered via Google login
        if (user.googleId) {
            return res.status(400).json({ message: 'This account is registered via Google login. Please use Google login to access your account.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const now = new Date();
        const expiryDate = new Date(now.getTime() + 60000);
        const formattedExpiry = expiryDate.toTimeString().slice(0, 5);

        user.otp = otp;
        user.otpExpiry = formattedExpiry;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: 'tastyflow01@gmail.com',
            to: email,
            subject: 'Reset Password from TastyFlow',
            text: `Your OTP is ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error sending email' });
            } else {
                res.status(200).json({ message: 'OTP sent successfully' });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is registered via Google login
        if (user.googleId) {
            return res.status(400).json({ message: 'This account is registered via Google login. Please use Google login to access your account.' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const now = new Date();
        if (user.otpExpiry < now) {
            user.otp = undefined;
            user.otpExpiry = undefined;
            await user.save();
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is registered via Google login
        if (user.googleId) {
            return res.status(400).json({ message: 'This account is registered via Google login. Please use Google login to access your account.' });
        }

        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Signup OTP Send
const signupOtpSend = async (req, res) => {
    const { name, email, password, contact } = req.body;

    // Validate email is Gmail
    if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Only Gmail addresses are allowed for signup' });
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const now = new Date();
        const expiryDate = new Date(now.getTime() + 60000); // 1 minute
        const formattedExpiry = expiryDate.toTimeString().slice(0, 5);

        // Create temporary user entry with OTP
        user = new User({
            name,
            email,
            password: 'temp', // Temporary password
            contact,
            otp,
            otpExpiry: formattedExpiry
        });
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: 'tastyflow01@gmail.com',
            to: email,
            subject: 'Verify your email for TastyFlow Signup',
            text: `Your OTP for signup is ${otp}. It expires in 1 minute.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error sending OTP email' });
            } else {
                res.status(200).json({ message: 'OTP sent successfully to your Gmail' });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Signup OTP Verify
const signupOtpVerify = async (req, res) => {
    const { email, otp, name, password, contact } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please start signup again.' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const now = new Date();
        if (user.otpExpiry < now) {
            user.otp = undefined;
            user.otpExpiry = undefined;
            await user.save();
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Hash password and create user
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        user.password = secPass;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const data = {
            user: {
                id: user.id,
            }
        };

        const authtoken = jwt.sign(data, process.env.JWT_SECRET);
        res.json({ success: true, authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
};

const addFoodToUser = async (req, res) => {
    const { userId } = req.params;  // User ID from params
    const { foods } = req.body;     // Array of food items and their quantities

    try {

        const user = await User.findById(userId);  // Fetch user by userId
        if (!user) {
            console.error("User not found with ID:", userId);
            return res.status(404).json({ message: "User not found" }); // Ensure proper JSON response
        }

        // Loop through the foods array and update the selectedFoods for the user
        for (const food of foods) {
            // Fetch the full food data from the Food model using the foodId
            const foodItem = await Food.findById(food.foodId);
            if (!foodItem) {
                console.error("Food item not found:", food.foodId);
                return res.status(404).json({ message: `Food item with ID ${food.foodId} not found` }); // Proper JSON response
            }

            // Check if the food already exists in the user's selectedFoods
            const existingFood = user.selectedFoods.find((f) => f.food.toString() === food.foodId);

            if (existingFood) {
                // If the food item already exists, update the quantity
                existingFood.quantity += food.quantity;  // Add the new quantity to the existing one
            } else {
                // If the food doesn't exist, add the food item to the selectedFoods array
                user.selectedFoods.push({
                    food: food.foodId,   // Store foodId
                    quantity: food.quantity,  // Store the quantity
                    price: foodItem.price,  // Store the price from the Food model
                    name: foodItem.name    // Store the name from the Food model
                });
            }
        }

        // Save the user document after updating the selectedFoods
        await user.save();

        // Send a success message
        res.json({ message: "Foods added to user successfully" });  // Return success as JSON
    } catch (error) {
        console.error("Error adding food to user:", error.message); // Log error details
        res.status(500).json({ message: "Server error" });  // Return error as JSON
    }
};

  // Send Invoice via email as a PDF
  const sendInvoice = async (req, res) => {
    try {
        const { userId } = req.body;
        const { invoiceId } = req.params;

        // Fetch user and invoice details
        const user = await User.findById(userId);
        const invoice = await Invoice.findById(invoiceId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Create a professional email template
        const emailHTML = generateInvoiceEmailHTML(invoice, user);

        const mailOptions = {
            from: 'tastyflow01@gmail.com',
            to: user.email,
            subject: `TastyFlow Invoice of ${user.name}`,
            html: emailHTML,
        };

        // Send the email using a nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Send the email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Invoice sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
  
  

const updateContact = async (req, res) => {
    try {
        const { contact } = req.body;

        let user;
        if (req.user.id) {
            // Existing user, update contact
            user = await User.findByIdAndUpdate(
                req.user.id,
                { $set: { contact: contact } },
                { new: true }
            ).select("-password");
        } else if (req.user.googleId) {
            // Temp user from OAuth, create new user
            user = new User({
                googleId: req.user.googleId,
                name: req.user.name,
                email: req.user.email,
                contact: contact,
            });
            await user.save();
        } else {
            return res.status(400).json({ error: "Invalid user data" });
        }

        // Generate new token with user id
        const data = {
            user: {
                id: user.id,
            }
        };
        const authtoken = jwt.sign(data, process.env.JWT_SECRET);

        res.json({ success: true, user, authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
};

module.exports = {
    createUser,
    loginUser,
    getUser,
    forgotPassword,
    verifyOtp,
    resetPassword,
    signupOtpSend,
    signupOtpVerify,
    getAllUsers,
    getUserId,
    addFoodToUser,
    sendInvoice,
    googleAuth,
    updateContact,
};
