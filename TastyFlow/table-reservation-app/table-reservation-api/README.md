# TastyFlow Backend API

A comprehensive Node.js/Express backend API for the TastyFlow table reservation and food ordering system.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control (User/Admin)
- **Table Reservation System**: Real-time table booking with slot management
- **Food Ordering**: Complete menu management with categories and pricing
- **Invoice Management**: Automated invoice generation with PDF support
- **Payment Integration**: Stripe payment processing for reservations and orders
- **Real-time Communication**: Socket.io for live updates on reservations and orders
- **Email Notifications**: Automated email confirmations and updates
- **Admin Dashboard**: Comprehensive admin panel for managing users, tables, food, and orders

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with Passport.js
- **Real-time**: Socket.io
- **Payments**: Stripe
- **Email**: Nodemailer
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **Validation**: Express-validator
- **Security**: bcryptjs for password hashing, CORS

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd table-reservation-app/table-reservation-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/tastyflow

   # JWT
   JWT_SECRET=your_jwt_secret_key

   # Email Configuration
   EMAIL=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key

   # Vonage (SMS - optional)
   VONAGE_API_KEY=your_vonage_api_key
   VONAGE_API_SECRET=your_vonage_api_secret

   # Twilio (SMS - optional)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Port
   PORT=5000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the server**
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /google` - Google OAuth login
- `GET /google/callback` - Google OAuth callback

### User Routes (`/api/user`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /reservations` - Get user reservations
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `GET /admin/all-users` - Get all users (Admin only)

### Slot Routes (`/api/slots`)
- `GET /:slotNumber` - Get all slots for a time slot
- `POST /:slotNumber/reserve` - Reserve a table
- `DELETE /:slotNumber/unreserve/:number` - Unreserve a table
- `POST /:slotNumber/admin-reserve` - Admin reserve a table
- `POST /:slotNumber/add` - Add a new table (Admin)
- `DELETE /:slotNumber/delete/:number` - Delete a table (Admin)
- `PATCH /:slotNumber/toggle/:number` - Enable/disable table (Admin)
- `GET /:slotNumber/available` - Get available tables

### Food Routes (`/api/food`)
- `GET /` - Get all food items
- `GET /categories` - Get food categories
- `POST /` - Add new food item (Admin)
- `PUT /:id` - Update food item (Admin)
- `DELETE /:id` - Delete food item (Admin)

### Invoice Routes (`/api/invoice`)
- `POST /` - Create new invoice
- `GET /` - Get all invoices (Admin)
- `GET /:invoiceId` - Get invoice by ID
- `PUT /:invoiceId` - Update invoice (Admin)
- `GET /user/:userId` - Get invoices by user
- `PATCH /:invoiceId/status` - Update invoice status (Admin)
- `POST /:invoiceId/payment` - Record payment (Admin)
- `GET /download/:invoiceId` - Download invoice PDF

### Message Routes (`/api/messages`)
- `GET /` - Get user messages
- `POST /` - Send message to admin
- `GET /admin` - Get all messages (Admin)
- `POST /admin/reply` - Admin reply to message

## Database Models

### User
- Personal information (name, email, contact)
- Authentication data (password hash, JWT tokens)
- Role (user/admin)
- Payment history
- Reservation history

### Slot
- Slot number (1-3 representing time slots)
- Table number
- Capacity
- Reservation status
- Reserved by (user reference)

### Food
- Name, description, price
- Category
- Image URL
- Availability status

### Invoice
- User reference
- Food items with quantities
- Total amount, taxes, discounts
- Payment status
- Reservation details (if applicable)

### Message
- Sender/Receiver information
- Message content
- Timestamp
- Read status

## Socket Events

### Client to Server
- `join-slot`: Join a slot room for real-time updates
- `join-user`: Join user-specific room
- `join-foodUpdates`: Join food updates room

### Server to Client
- `slotUpdated`: Table reservation status changes
- `newReservation`: New reservation notification
- `reservationRemoved`: Reservation cancellation
- `tableAdded`: New table added
- `tableDeleted`: Table removed
- `foodUpdated`: Food menu changes

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Stateless authentication with expiration
- **Role-based Access**: Admin and user role separation
- **Input Validation**: Express-validator for request validation
- **CORS Protection**: Configured CORS policies
- **Rate Limiting**: Basic rate limiting on sensitive endpoints

## Development

### Project Structure
```
table-reservation-api/
├── controllers/          # Route handlers
├── models/              # MongoDB schemas
├── routes/              # API routes
├── middleware/          # Custom middleware
├── utils/               # Utility functions
├── config/              # Configuration files
├── server.js            # Main server file
├── passportConfig.js    # Passport authentication config
└── package.json
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (when implemented)

## Deployment

1. Set up environment variables for production
2. Configure MongoDB database
3. Set up reverse proxy (nginx recommended)
4. Configure SSL certificates
5. Set up process manager (PM2 recommended)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support, please contact the development team or create an issue in the repository.
