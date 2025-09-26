import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';
import logo from "../../assets/logo.svg";

const Signup = (props) => {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
    contact: ""
  });
  
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
    contact: ""
  });
  
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    cpassword: false,
    contact: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: otp
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  let navigate = useNavigate();
  const { name, email, password, cpassword, contact } = credentials;

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Full name is required";
        } else if (value.length < 3) {
          error = "Name must be at least 3 characters";
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          error = "Name contains invalid characters";
        }
        break;
        
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
        
      case "contact":
        if (!value.trim()) {
          error = "Phone number is required";
        } else if (!/^[0-9]{10,15}$/.test(value)) {
          error = "Please enter a valid phone number (10-15 digits)";
        }
        break;
        
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/.test(value)) {
          error = "Password must contain uppercase, lowercase, number, and special character";
        }
        break;
        
      case "cpassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (password !== value) {
          error = "Passwords do not match";
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    
    const error = validateField(name, credentials[name]);
    setErrors({ ...errors, [name]: error });
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    
    // Only validate if the field has been touched (blurred)
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    Object.keys(credentials).forEach(key => {
      newErrors[key] = validateField(key, credentials[key]);
      if (newErrors[key]) isValid = false;
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched on submit
    const allTouched = {};
    Object.keys(touched).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/signup-otp-send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          contact: contact.trim(),
        }),
      });

      const json = await response.json();

      if (response.ok) {
        setStep(2);
        props.showAlert("OTP sent to your Gmail. Please check your email.", "success");
      } else {
        if (json.message.includes("Gmail")) {
          setErrors(prev => ({ ...prev, email: json.message }));
        } else {
          props.showAlert(json.message || "Failed to send OTP", "danger");
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      props.showAlert("An error occurred during registration", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/signup-otp-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          name: name.trim(),
          password,
          contact: contact.trim(),
        }),
      });

      const json = await response.json();

      if (json.success) {
        localStorage.setItem('token', json.authtoken);
        navigate("/");
        props.showAlert("Account Created Successfully", "success");
      } else {
        setOtpError(json.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtpError("An error occurred during verification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='signup-page-container'>
      <div className='signup-image-container'>
        <div className='signup-image-overlay'></div>
        <div className='signup-restaurant-quote'>
          <h2>Welcome to</h2>
          <h1>Tastyflow</h1>
          <p>Where culinary excellence meets unforgettable experiences</p>
          <div className="signup-benefits-list">
            <div className="signup-benefit-item">
              <span className="signup-benefit-icon">✓</span>
              <span>Exclusive member rewards</span>
            </div>
            <div className="signup-benefit-item">
              <span className="signup-benefit-icon">✓</span>
              <span>Priority reservations</span>
            </div>
            <div className="signup-benefit-item">
              <span className="signup-benefit-icon">✓</span>
              <span>Personalized dining recommendations</span>
            </div>
          </div>
        </div>
      </div>

      <div className='signup-form-container'>
        <div className='signup-content'>
          <div className='signup-restaurant-logo'>
            <img src={logo} alt="Tastyflow" className='signup-logo-image' />
          </div>

          <div className='signup-card'>
            <div className='signup-header'>
              <h1 className='signup-heading'>
                {step === 1 ? 'Create Your Account' : 'Verify Your Email'}
              </h1>
              <p className='signup-subheading'>
                {step === 1 ? 'Join our culinary community today' : 'Enter the OTP sent to your Gmail'}
              </p>
            </div>

            {step === 1 ? (
              <form onSubmit={handleSubmit} className='signup-form' noValidate>
                <div className="signup-form-group">
                  <input
                    type="text"
                    name='name'
                    className={`signup-form-input ${touched.name && errors.name ? 'signup-error' : ''}`}
                    onChange={onChange}
                    onBlur={handleBlur}
                    value={name}
                    placeholder="Full Name"
                  />
                  {touched.name && errors.name && <span className="signup-error-message">{errors.name}</span>}
                </div>

                <div className="signup-form-group">
                  <input
                    type="email"
                    name='email'
                    className={`signup-form-input ${touched.email && errors.email ? 'signup-error' : ''}`}
                    onChange={onChange}
                    onBlur={handleBlur}
                    value={email}
                    placeholder="Email Address (Gmail only)"
                  />
                  {touched.email && errors.email && <span className="signup-error-message">{errors.email}</span>}
                </div>

                <div className="signup-form-group">
                  <input
                    type="tel"
                    name='contact'
                    className={`signup-form-input ${touched.contact && errors.contact ? 'signup-error' : ''}`}
                    onChange={onChange}
                    onBlur={handleBlur}
                    value={contact}
                    placeholder="Phone Number (10-15 digits)"
                  />
                  {touched.contact && errors.contact && <span className="signup-error-message">{errors.contact}</span>}
                </div>

                <div className="signup-form-group">
                  <input
                    type="password"
                    name='password'
                    className={`signup-form-input ${touched.password && errors.password ? 'signup-error' : ''}`}
                    onChange={onChange}
                    onBlur={handleBlur}
                    value={password}
                    placeholder="Create Password (min 6 characters)"
                  />
                  {touched.password && errors.password && <span className="signup-error-message">{errors.password}</span>}
                </div>

                <div className="signup-form-group">
                  <input
                    type="password"
                    name='cpassword'
                    className={`signup-form-input ${touched.cpassword && errors.cpassword ? 'signup-error' : ''}`}
                    onChange={onChange}
                    onBlur={handleBlur}
                    value={cpassword}
                    placeholder="Confirm Password"
                  />
                  {touched.cpassword && errors.cpassword && <span className="signup-error-message">{errors.cpassword}</span>}
                </div>

                <button
                  type="submit"
                  className="signup-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                </button>

                <div className="signup-terms-agreement">
                  <p>By creating an account, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link></p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className='signup-form' noValidate>
                <div className="signup-form-group">
                  <input
                    type="text"
                    className={`signup-form-input ${otpError ? 'signup-error' : ''}`}
                    onChange={(e) => setOtp(e.target.value)}
                    value={otp}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                  {otpError && <span className="signup-error-message">{otpError}</span>}
                </div>

                <button
                  type="submit"
                  className="signup-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify & Create Account'}
                </button>

                <button
                  type="button"
                  className="signup-back-btn"
                  onClick={() => setStep(1)}
                >
                  Back to Form
                </button>
              </form>
            )}

            <div className="signup-auth-redirect">
              <p>Already have an account? <Link to="/login" className="signup-login-link">Sign In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;