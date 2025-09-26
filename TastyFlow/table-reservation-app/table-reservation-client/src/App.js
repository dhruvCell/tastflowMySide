import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Alert from './components/Alert/Alert';
import Navbar from './components/Navbar/Navbar';
import AppRoutes from './routes/routes';
import { SocketProvider } from './context/SocketContext';
import { FoodProvider } from './context/FoodContext';
import { MessageProvider } from './context/MessageContext';


  
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [alert, setAlert] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 1500);
  };

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await fetch("http://localhost:5000/api/users/getuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      return null;
    }
  };

  useEffect(() => {
    const getUserDetails = async () => {
      const userData = await fetchUserDetails();
      setUserDetails(userData);
      localStorage.setItem("userDetails", JSON.stringify(userData));
      setLoading(false);

      if (!userData && localStorage.getItem("token")) {
        localStorage.removeItem("token");
      }
    };

    getUserDetails();
  }, []);

  const hideNavbarRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/complete-profile'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <SocketProvider>
      <FoodProvider>
        <MessageProvider>
        {shouldShowNavbar && <Navbar showAlert={showAlert} userDetails={userDetails} />}
        <Alert alert={alert} />
        <AppRoutes showAlert={showAlert} />
        </MessageProvider>
      </FoodProvider>
    </SocketProvider>
  );
}

export default AppWrapper;  