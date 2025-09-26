# TastyFlow - Table Reservation API

A robust Node.js/Express backend API for the TastyFlow table reservation and food ordering system. This API provides comprehensive endpoints for user management, food ordering, table reservations, invoicing, and real-time communication.

## Features

### Core Features
- **User Management**: Registration, authentication, OAuth (Google), profile management
- **Food Management**: CRUD operations for menu items, categories, and inventory
- **Table Reservations**: Slot management, booking system with availability tracking
- **Order Processing**: Food ordering, cart management, payment processing
- **Invoice Generation**: PDF invoice creation, email delivery, payment tracking
- **Real-time Messaging**: Socket.io integration for live chat between users and admins
- **Admin Dashboard**: Comprehensive analytics and management tools

### Technical Features
- **Authentication & Authorization**: JWT tokens, Passport.js, role-based access control
- **Payment Integration**: Stripe payment processing with webhooks
- **File Uploads**: Multer for image uploads (food items, user profiles)
- **Email & SMS Notifications**: Nodemailer and Twilio integration
- **Scheduled Tasks**: Node-cron for automated cleanup and notifications
- **Real-time Communication**: Socket.io for instant messaging
- **Data Validation**: Express-validator for input sanitization
- **Security**: CORS, session management, password hashing with bcrypt

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (Local & Google OAuth)
- **Real-time**: Socket.io
- **Payments**: Stripe
- **File Uploads**: Multer
- **Email**: Nodemailer
- **Scheduling**: Node-cron
- **Validation**: Express-validator
- **Security**: bcryptjs, CORS, express-session
- **PDF Generation**: PDFKit
- **Development**: Nodemon

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd table-reservation-app/table-reservation-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the following environment variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/tastyflow
   SESSION_SECRET=your_session_secret_key
   JWT_SECRET=your_jwt_secret_key

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Email (Nodemailer)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Starts the server with nodemon (development)
- `npm start` - Starts the server with node (production)
- `npm test` - Runs tests (currently not implemented)

## Project Structure

```
├── controllers/         # Business logic controllers
│   ├── userController.js    # User management
│   ├── foodController.js    # Food/menu management
│   ├── slotController.js    # Reservation slots
│   └── invoiceController.js # Invoice generation
├── models/             # MongoDB schemas
│   ├── User.js         # User model
│   ├── Food.js         # Food item model
│   ├── Slot.js         # Reservation slot model
│   ├── Invoice.js      # Invoice model
│   └── Message.js      # Chat message model
├── routes/             # API route definitions
│   ├── userRoute.js    # User-related endpoints
│   ├── foodRoute.js    # Food-related endpoints
│   ├── slotRoutes.js   # Reservation endpoints
│   ├── InvoiceRoute.js # Invoice endpoints
│   └── messageRoutes.js # Messaging endpoints
├── middleware/         # Custom middleware
│   └── fetchUser.js    # JWT authentication middleware
├── utils/              # Utility functions
│   ├── pdfInvoiceGenerator.js # PDF creation
│   └── emailTemplates.js      # Email templates
├── uploads/            # File upload directory
├── passportConfig.js   # Passport authentication setup
├── server.js           # Main server file
└── package.json        # Dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/getuser` - Get user profile
- `POST /api/users/forgot-password` - Password reset request
- `POST /api/users/reset-password` - Password reset
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### Food Management
- `GET /api/food` - Get all food items
- `POST /api/food` - Add new food item (Admin)
- `PUT /api/food/:id` - Update food item (Admin)
- `DELETE /api/food/:id` - Delete food item (Admin)
- `GET /api/food/:id` - Get food item details

### Reservations
- `GET /api/slot` - Get available slots
- `POST /api/slot` - Create reservation
- `GET /api/slot/:id` - Get slot details
- `PUT /api/slot/:id` - Update slot (Admin)
- `DELETE /api/slot/:id` - Delete slot (Admin)

### Invoices
- `GET /api/invoice` - Get user invoices
- `POST /api/invoice` - Create invoice (Admin)
- `GET /api/invoice/:id` - Get invoice details
- `PUT /api/invoice/:id` - Update invoice (Admin)
- `DELETE /api/invoice/:id` - Delete invoice (Admin)

### Messaging
- `GET /api/message` - Get messages
- `POST /api/message` - Send message
- `PUT /api/message/:id` - Update message
- `DELETE /api/message/:id` - Delete message

## Socket.io Events

### Client to Server
- `joinRoom` - Join a chat room
- `joinFoodRoom` - Join food updates room
- `joinAdminMessageRoom` - Join admin messages room
- `joinUserRoom` - Join user-specific room

### Server to Client
- Real-time message broadcasting
- Food menu updates
- Reservation status updates

## Database Models

### User
- Personal information (name, email, phone)
- Authentication data (password hash, OAuth tokens)
- Role (user/admin)
- Profile completion status

### Food
- Name, description, category
- Ingredients, preparation steps
- Nutritional information
- Price, availability
- Image URL

### Slot
- Date, time, table number
- Reservation status
- User association
- Payment information

### Invoice
- Order details, items, quantities
- Total amount, payment status
- User and admin associations
- PDF generation data

### Message
- Sender, receiver, content
- Timestamp, read status
- Room association

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (defaults to 5000) |
| MONGO_URI | MongoDB connection string | Yes |
| SESSION_SECRET | Express session secret | Yes |
| JWT_SECRET | JWT signing secret | Yes |
| STRIPE_SECRET_KEY | Stripe secret key | Yes |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret | Yes |
| GOOGLE_CLIENT_ID | Google OAuth client ID | Yes (for OAuth) |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret | Yes (for OAuth) |
| EMAIL_USER | Email service username | Yes (for notifications) |
| EMAIL_PASS | Email service password | Yes (for notifications) |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Create a Pull Request

## License

This project is licensed under the ISC License.
