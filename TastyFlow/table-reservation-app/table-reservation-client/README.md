# TastyFlow - Table Reservation Client

A modern, responsive React frontend for the TastyFlow table reservation and food ordering system. This application allows users to browse menus, make table reservations, place food orders, and manage their accounts, while providing administrators with comprehensive management tools.

## Features

### User Features
- **User Authentication**: Login, signup, OAuth (Google), password reset
- **Table Reservation**: Browse available slots, reserve tables with date/time selection
- **Food Ordering**: Browse menu, view food details, place orders
- **Invoice Management**: View order history, download/print invoices
- **Real-time Messaging**: Chat with administrators
- **Profile Management**: Update personal information and preferences
- **Reviews & Ratings**: Rate and review food items

### Admin Features
- **Dashboard**: Overview of reservations, orders, and users
- **User Management**: View and manage all users
- **Food Management**: Add, edit, delete menu items
- **Reservation Management**: View and manage table reservations
- **Invoice Management**: Generate and manage invoices
- **Analytics**: View graphs and statistics
- **Real-time Communication**: Respond to user messages

### Technical Features
- **Responsive Design**: Mobile-first approach with Bootstrap and custom CSS
- **Real-time Updates**: Socket.io integration for live messaging and notifications
- **Payment Integration**: Stripe payment processing for reservations
- **File Uploads**: Image uploads for food items and user profiles
- **Data Visualization**: Charts and graphs using Recharts
- **Sound Effects**: Audio feedback for user interactions

## Tech Stack

- **Frontend Framework**: React 18
- **Routing**: React Router DOM
- **State Management**: React Context API
- **UI Components**: Ant Design, React Bootstrap
- **Styling**: CSS3, Styled Components, GSAP animations
- **HTTP Client**: Axios
- **Real-time Communication**: Socket.io Client
- **Payment Processing**: Stripe Elements
- **Date Handling**: date-fns
- **Charts**: Recharts
- **Icons**: FontAwesome, React Icons
- **Audio**: Howler.js
- **Build Tool**: Create React App

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API server running (see API README)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd table-reservation-app/table-reservation-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:5000
   REACT_APP_STRIPE_CLIENT_KEY=your_stripe_publishable_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (irreversible)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── LoginSignup/     # Authentication components
│   ├── Navbar/          # Navigation bar
│   ├── Sidebar/         # Admin sidebar
│   ├── TableComponent/  # Reservation interface
│   ├── Invoice/         # Invoice display
│   └── ...
├── context/             # React Context providers
│   ├── FoodContext.js   # Food-related state
│   ├── MessageContext.js # Messaging state
│   └── SocketContext.js # Socket.io connection
├── routes/              # Route definitions
├── utils/               # Utility functions
├── assets/              # Static assets
└── App.js               # Main application component
```

## Key Components

- **App.js**: Main component with routing and providers
- **AppRoutes.js**: Centralized route definitions
- **UserPanel**: Landing page for authenticated users
- **Admin**: Admin dashboard with management tools
- **TableComponent**: Table reservation interface with Stripe integration
- **Invoice**: Invoice generation and display

## API Integration

The frontend communicates with the backend API at `http://localhost:5000` for:
- User authentication and management
- Food menu data
- Reservation slots
- Order processing
- Invoice generation
- Real-time messaging

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| REACT_APP_STRIPE_CLIENT_KEY | Stripe publishable key | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Create a Pull Request

## License

This project is licensed under the ISC License.
