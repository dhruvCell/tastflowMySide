# TastyFlow Frontend Client

A modern, responsive React frontend for the TastyFlow table reservation and food ordering system.

## Features

- **User Authentication**: Secure login/signup with JWT tokens and Google OAuth
- **Table Reservation**: Interactive table booking with real-time availability
- **Food Ordering**: Comprehensive menu browsing with categories and search
- **Admin Dashboard**: Full administrative control panel
- **Real-time Updates**: Live reservation status and order tracking
- **Responsive Design**: Mobile-first approach with Bootstrap and custom CSS
- **Payment Integration**: Stripe-powered secure payments
- **Invoice Management**: Digital invoice viewing and printing
- **User Dashboard**: Personal reservation and order history
- **Review System**: Customer feedback and ratings

## Tech Stack

- **Framework**: React 18 with Hooks
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **Styling**: Bootstrap 5, Styled Components, Custom CSS
- **HTTP Client**: Axios
- **Real-time Communication**: Socket.io Client
- **Payment Processing**: Stripe React SDK
- **UI Components**: Ant Design, React Bootstrap
- **Animations**: GSAP, React Confetti
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Form Handling**: React Hook Form
- **Notifications**: React Toastify
- **Icons**: FontAwesome, React Icons

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd table-reservation-app/table-reservation-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
table-reservation-client/
├── public/                    # Static assets
│   ├── sounds/               # Audio files
│   └── images/               # Image assets
├── src/
│   ├── components/           # React components
│   │   ├── AdminTable/       # Admin table management
│   │   ├── ChoiceOfCustomers/# Customer selection
│   │   ├── FoodDetail/       # Food item details
│   │   ├── Invoice/          # Invoice display
│   │   ├── LoginSignup/      # Authentication
│   │   ├── Menu Page/        # Food menu
│   │   ├── Navbar/           # Navigation
│   │   ├── Sidebar/          # Admin sidebar
│   │   ├── TableShow/        # Table reservation
│   │   ├── UserDashboard/    # User dashboard
│   │   └── ...
│   ├── contexts/             # React contexts
│   ├── routes/               # Route definitions
│   ├── utils/                # Utility functions
│   ├── App.js                # Main app component
│   ├── index.js              # Entry point
│   └── styles/               # Global styles
└── package.json
```

## Key Components

### Authentication Flow
- **Login/Signup**: JWT-based authentication with form validation
- **Google OAuth**: Social login integration
- **Password Reset**: Email-based password recovery
- **Profile Management**: User profile updates

### Table Reservation System
- **Slot Selection**: Choose from 3 time slots (5-7PM, 7-9PM, 9-11PM)
- **Table Selection**: Interactive table grid with capacity indicators
- **Real-time Updates**: Live availability using Socket.io
- **Admin Assistance**: Admin can reserve tables for users

### Food Ordering
- **Menu Categories**: Organized food items by category
- **Search & Filter**: Find items quickly
- **Cart Management**: Add/remove items with quantity control
- **Order Summary**: Review before checkout

### Admin Features
- **User Management**: View and manage all users
- **Table Management**: Add/edit/delete tables, manage availability
- **Food Management**: CRUD operations for menu items
- **Order Management**: Process and track orders
- **Analytics**: Dashboard with charts and statistics

## Available Scripts

- `npm start` - Start development server on port 3000
- `npm run build` - Create production build
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API base URL | Yes |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `REACT_APP_SOCKET_URL` | Socket.io server URL | Yes |

## Key Features Implementation

### Real-time Communication
```javascript
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_URL);

// Join slot room for updates
socket.emit('join-slot', slotNumber);

// Listen for table updates
socket.on('slotUpdated', (data) => {
  // Update UI accordingly
});
```

### Payment Integration
```javascript
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
```

### State Management
```javascript
// Using React Context for global state
const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);

  // Context methods
  const login = async (credentials) => { /* ... */ };
  const logout = () => { /* ... */ };

  return (
    <UserContext.Provider value={{ user, reservations, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
```

## Responsive Design

The application is fully responsive with:
- **Mobile-first approach** using Bootstrap grid system
- **Custom breakpoints** for optimal viewing on all devices
- **Touch-friendly interfaces** for mobile users
- **Progressive enhancement** for better performance

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

- **Code Splitting**: Route-based code splitting with React.lazy
- **Image Optimization**: Lazy loading and responsive images
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching**: Service worker for offline functionality
- **Minification**: Production builds with minified assets

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Deployment

### Build for Production
```bash
npm run build
```

### Serve Static Files
```bash
npm install -g serve
serve -s build -l 3000
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Style

- **ESLint**: Configured with React and Airbnb rules
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks for code quality
- **Component Structure**: Functional components with hooks

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Verify backend server is running
   - Check environment variables
   - Ensure CORS is properly configured

2. **Socket Connection Problems**
   - Check Socket.io server configuration
   - Verify client and server versions match
   - Check network/firewall settings

3. **Payment Integration Issues**
   - Verify Stripe keys are correct
   - Check payment method configuration
   - Ensure webhook endpoints are set up

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## Changelog

### Version 1.0.0
- Initial release with core features
- Table reservation system
- Food ordering functionality
- Admin dashboard
- Real-time updates
- Payment integration
