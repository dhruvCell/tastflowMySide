import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import UserPanel from './components/UserPanel/UserPanel';
import Login from './components/LoginSignup/Login';
import OAuthCallback from './components/LoginSignup/OAuthCallback';
import Alert from './components/Alert/Alert';
import Navbar from './components/Navbar/Navbar';
import Info from './components/Info/Info';
import Signup from './components/LoginSignup/signup';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import ResetPassword from './components/ResetPassword/ResetPassword';
import Admin from './components/Sidebar/Admin';
import Add from './components/Add/Add';
import List from './components/List/List';
import TableComponent from './components/TableComponent/TableComponent';
import UserData from './components/UserData/UserData';
import Reviews from './components/Reviews/Reviews';
import UserReviews from './components/UserReviews/UserReviews';
import About from './components/About/About';
import AdminTable from './components/AdminTable/AdminTable';
import SlotTable from './components/TableShow/SlotTable';
import UsersList from './components/UsersList/UsersList';
import UserFoodPage from './components/UserFoodPage/UserFoodPage';
import Invoices from './components/Invoice/Invoice';
import UserDashBoard from './components/UserDashboard/UserDashboard';
import InvoiceList from './components/InvoiceList/InvoiceList';
import InvoiceDetail from './components/UserInvoiceList/UserInvoiceList';
import EditInvoice from './components/EditInvoice/EditInvoice';
import UserInvoice from "./components/UserInvoice/UserInvoice";
import Graph from "./components/Graph/Graph";
import FoodDetail from "./components/FoodDetail/FoodDetail";
import Services from './components/Services/Services';
import BlogDeatils from './components/BlogDetails/BlogDetails';
import Recipes from "./components/Recipes/Recipes"
import Menu_Page from './components/Menu Page/Menu_Page';
import { SocketProvider } from './context/SocketContext';
import { FoodProvider } from './context/FoodContext';
import { MessageProvider } from './context/MessageContext';



const stripePromise = loadStripe('pk_test_51PM6qtRwUTaEqzUvS6OJGM3YihHTBzBe1X4lPiFacZgFvyHU6E27K7n9qzkmzJoi2V0JH66T7fCpL9MgQCVYerTD00lU9wNdOf');

function PrivateRoute({ element, ...rest }) {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/login" />;
}

function AdminRoute({ element, ...rest }) {
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  return userDetails?.role === 'admin' ? element : <Navigate to="/" />;
}
  
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

  const hideNavbarRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <SocketProvider>
      <FoodProvider>
        <MessageProvider>
        {shouldShowNavbar && <Navbar showAlert={showAlert} userDetails={userDetails} />}
        <Alert alert={alert} />
        <Routes>
          <Route path="/login" element={<Login showAlert={showAlert} />} />
          <Route path="/auth/callback" element={<OAuthCallback showAlert={showAlert} />} />
          <Route path="/" element={<UserPanel showAlert={showAlert} />} />
          <Route path="/signup" element={<Signup showAlert={showAlert} />} />
          <Route path="/info" element={<PrivateRoute element={<Info showAlert={showAlert} />} />} />
          <Route path="/forgot-password" element={<ForgotPassword showAlert={showAlert} />} />
          <Route path="/reset-password" element={<ResetPassword showAlert={showAlert} />} />
          <Route path="/table-reserve" element={<PrivateRoute element={<Elements stripe={stripePromise}><TableComponent showAlert={showAlert} /></Elements>} />}/>
          <Route path="/admin" element={<AdminRoute element={<Admin showAlert={showAlert} />} />} />
          <Route path="/admin/list" element={<AdminRoute element={<List showAlert={showAlert} />} />} />
          <Route path="/admin/add" element={<AdminRoute element={<Add showAlert={showAlert} />} />} />
          <Route path="/admin/all-users" element={<AdminRoute element={<UserData showAlert={showAlert} />} />} />
          <Route path="/admin/all-reviews" element={<AdminRoute element={<Reviews showAlert={showAlert} />} />} />
          <Route path="/admin/users/reviews/:userId" element={<PrivateRoute element={<UserReviews />} />} />
          <Route path="/admin/admin-table" element={<AdminRoute element={<AdminTable showAlert={showAlert} />} />} />
          <Route path="/admin/slot/:slotNumber" element={<AdminRoute element={<SlotTable showAlert={showAlert} />} />} />
          <Route path="/admin/create-bill" element={<AdminRoute element={<UsersList showAlert={showAlert} />} />} />
          <Route path="/admin/user/:userId/create-bill" element={<AdminRoute element={<UserFoodPage showAlert={showAlert} />} />} />
          <Route path="/admin/invoice" element={<AdminRoute element={<Invoices showAlert={showAlert} />} />} />
          <Route path="/admin/user/dash-board/:userId" element={<AdminRoute element={<UserDashBoard showAlert={showAlert} />} />} />
          <Route path="/admin/all-invoices" element={<AdminRoute element={<InvoiceList showAlert={showAlert} />} />} />
          <Route path="/admin/invoices/:invoiceId" element={<AdminRoute element={<InvoiceDetail showAlert={showAlert} />} />} />
          <Route path="/admin/invoices/edit/:invoiceId" element={<AdminRoute element={<EditInvoice showAlert={showAlert} />} />} />
          <Route path="/admin/users/invoice/:userId" element={<PrivateRoute element={<UserInvoice />} />} />
          <Route path="/admin/graph" element={<AdminRoute element={<Graph />} />} />
          <Route path="/food/:id" element={<FoodDetail />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/About" element={<About />} />
          <Route path="/Menu_Page" element={<Menu_Page />} />
          <Route path="/Recipes" element={<Recipes />} />
          <Route path='/Services' element={<Services/>}/>
          <Route path='/BlogDetails' element={<BlogDeatils/>}/>
        </Routes>
        </MessageProvider>
      </FoodProvider>
    </SocketProvider>
  );
}

export default AppWrapper;  