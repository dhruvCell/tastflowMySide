import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallback = (props) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if there's a token in the URL or response
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
          localStorage.setItem('token', token);
          // Fetch user details to check if contact is provided
          const response = await fetch("http://localhost:5000/api/users/getuser", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": token
            }
          });

          if (response.ok) {
            const user = await response.json();
            if (!user.contact || user.contact.trim() === '') {
              // Contact not provided, redirect to complete profile
              props.showAlert("Please complete your profile", "info");
              navigate("/complete-profile");
            } else {
              props.showAlert("Logged In Successfully with Google", "success");
              navigate("/");
            }
          } else {
            props.showAlert("OAuth login failed", "danger");
            navigate("/login");
          }
        } else {
          // If no token in URL, check if user is authenticated via session
          const existingToken = localStorage.getItem('token');
          if (existingToken) {
            const response = await fetch("http://localhost:5000/api/users/getuser", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "auth-token": existingToken
              }
            });

            if (response.ok) {
              const user = await response.json();
              if (!user.contact || user.contact.trim() === '') {
                // Contact not provided, redirect to complete profile
                props.showAlert("Please complete your profile", "info");
                navigate("/complete-profile");
              } else {
                // Don't show success alert here to avoid double notification
                navigate("/");
              }
            } else {
              props.showAlert("OAuth login failed", "danger");
              navigate("/login");
            }
          } else {
            props.showAlert("OAuth login failed", "danger");
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        props.showAlert("OAuth login failed", "danger");
        navigate("/login");
      }
    };

    handleOAuthCallback();
  }, [navigate, props]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#1B1C1F',
      color: '#ffffff'
    }}>
      <div>
        <h2>Processing Google Login...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
