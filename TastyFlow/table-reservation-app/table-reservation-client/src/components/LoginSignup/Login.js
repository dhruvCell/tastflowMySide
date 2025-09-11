import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './Login.css';
import logo from "../../assets/logo.svg";

const Login = (props) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  let navigate = useNavigate();
  const location = useLocation();
  const { email, password } = credentials;

  useEffect(() => {
    // Check for OAuth error in URL parameters
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error');
    const email = urlParams.get('email');

    if (error) {
      props.showAlert(error, "danger");
      if (email) {
        setCredentials((prev) => ({ ...prev, email }));
      }
      // Clear the error and email from URL
      navigate('/login', { replace: true });
    }
  }, [location.search, navigate, props]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password
      }),
    });

    const json = await response.json();
    console.log(json);

    if (json.success) {
      localStorage.setItem('token', json.authtoken);
      navigate("/");
      props.showAlert("Logged In Successfully", "success");
    } else {
      props.showAlert(json.error || "Invalid Credentials", "danger");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className='lgn-page-container'>
      {/* Left side with restaurant image */}
      <div className='lgn-image-container'>
        <div className='lgn-image-overlay'></div>
        <div className='lgn-restaurant-quote'>
          <h2>Welcome to</h2>
          <h1>Tastyflow</h1>
          <p>Crafting culinary excellence since 1995</p>
        </div>
      </div>
      
      {/* Right side with login form */}
      <div className='lgn-form-container'>
        {/* Restaurant logo */}
        <div className='lgn-logo-container'>
          <img src={logo} alt="TastyFlow" className='lgn-logo-image' />
        </div>
        
        {/* Login form */}
        <div className='lgn-card'>
          <h1 className='lgn-heading'>Sign In</h1>
          <p className='lgn-subheading'>Access your account to continue</p>
          
          <form onSubmit={handleSubmit} className="lgn-form">
            <div className="lgn-form-group">
              <label htmlFor="email" className="lgn-form-label">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name='email' 
                className="lgn-form-input" 
                onChange={onChange} 
                value={email} 
                placeholder="Enter your email"
              />
            </div>
            
            <div className="lgn-form-group">
              <label htmlFor="password" className="lgn-form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                name='password' 
                className="lgn-form-input" 
                onChange={onChange} 
                value={password} 
                placeholder="••••••••"
              />
            </div>
            
            <div className="lgn-form-options">
              <div className="lgn-remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="/forgot-password" className="lgn-forgot-password">Forgot Password?</Link>
            </div>
            
            <button type="submit" className="lgn-submit-btn">Sign In</button>

            <div className="lgn-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="lgn-google-btn"
              onClick={() => window.location.href = 'http://localhost:5000/api/users/auth/google'}
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="lgn-google-icon"
              />
              Continue with Google
            </button>

            <div className="lgn-signup-link">
              Don't have an account? <Link to="/signup" className="lgn-signup-link-text">Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;