import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // Assuming it uses the same styles as Signup
import logo from "../../assets/logo.svg";

const CompleteProfile = (props) => {
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/update-contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token,
        },
        body: JSON.stringify({ contact }),
      });

      const json = await response.json();

      if (response.ok) {
        // Update token in localStorage with the new token
        if (json.authtoken) {
          localStorage.setItem('token', json.authtoken);
        }
        props.showAlert('Profile updated successfully!', 'success');
        navigate('/');
      } else {
        props.showAlert(json.message || 'Failed to update profile', 'danger');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      props.showAlert('Server error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page-container">
      <div className="signup-image-container">
        <div className="signup-image-overlay"></div>
        <div className="signup-restaurant-quote">
          <h2>Complete Your Profile</h2>
          <p>Just one more step to get started with your dining experience.</p>
          <div className="signup-benefits-list">
            <div className="signup-benefit-item">
              <span className="signup-benefit-icon">✓</span>
              <span>Personalized reservations</span>
            </div>
            <div className="signup-benefit-item">
              <span className="signup-benefit-icon">✓</span>
              <span>Exclusive offers and updates</span>
            </div>
            <div className="signup-benefit-item">
              <span className="signup-benefit-icon">✓</span>
              <span>Seamless ordering experience</span>
            </div>
          </div>
        </div>
      </div>
      <div className="signup-form-container">
        <div className="signup-content">
          <div className="signup-restaurant-logo">
              <img src={logo} alt="TastyFlow" className='lgn-logo-image' />
          </div>
          <div className="signup-card">
            <div className="signup-header">
              <h2 className="signup-heading">Complete Your Profile</h2>
              <p className="signup-subheading">Add your contact number to continue</p>
            </div>
            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="signup-form-group">
                <input
                  type="tel"
                  name="contact"
                  className="signup-form-input"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Phone Number (10-15 digits)"
                  required
                  minLength={10}
                />
              </div>
              <button
                type="submit"
                className="signup-submit-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
