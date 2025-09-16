import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Info.css';

const Info = () => {
  const [userDetails, setUserDetails] = useState({ name: "", email: "", id: "" }); // State to hold the user's details
  const [messages, setMessages] = useState([]); // State to hold the user's messages
  const [messagesLoading, setMessagesLoading] = useState(false); // Loading state for messages
  const [showMessages, setShowMessages] = useState(false); // Toggle to show/hide messages
  let navigate = useNavigate();
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return null; // Return null if token is not available
      }
      const response = await fetch("http://localhost:5000/api/users/getuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });
      if (response.ok) {
        return await response.json(); // Return the fetched user's details
      } else {
        return null; // Return null if fetch fails
      }
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      return null; // Return null if an error occurs
    }
  };

  const fetchMessages = async () => {
    if (!userDetails._id) return;

    setMessagesLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/message/admin/all-reviews/${userDetails._id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error("Failed to fetch messages");
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error.message);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    const getUserDetails = async () => {
      const userData = await fetchUserDetails();
      if(localStorage.getItem("token")){
        setUserDetails(userData);
      }else{
        navigate("/login");
      }
       // eslint-disable-next-line
      if (userData) {
        setUserDetails(userData); // Set userDetails to the fetched user's details
      } else {
        setUserDetails({ name: "", email: "", id: "" }); // Reset userDetails if fetch fails
      }
    };

    getUserDetails();
  }, []);

  return (
    <div className='container info my-4'>
      <h1>Personal Information</h1>
      {userDetails.name ? (
        <>
          <table className='user-table'>
            <tbody>
              <tr>
                <th>User Name:</th>
                <td>{userDetails.name}</td>
              </tr>
              <tr>
                <th>User Email:</th>
                <td>{userDetails.email}</td>
              </tr>
              <tr>
                <th>User ID:</th>
                <td>{userDetails._id}</td>
              </tr>
              <tr>
                <th>User Role:</th>
                <td>{userDetails.role}</td>
              </tr>
            </tbody>
          </table>
          <div className="info-actions">
            <button
              className="invoice-btn"
              onClick={() => navigate('/user/invoices')}
            >
              View My Invoices
            </button>
            <button
              className="message-btn"
              onClick={() => {
                setShowMessages(!showMessages);
                if (!showMessages && messages.length === 0) {
                  fetchMessages();
                }
              }}
            >
              {showMessages ? 'Hide My Messages' : 'View My Messages'}
            </button>
          </div>

          {showMessages && (
            <div className="messages-section">
              <h2>My Messages</h2>
              {messagesLoading ? (
                <p>Loading messages...</p>
              ) : messages.length > 0 ? (
                <div className="messages-list">
                  {messages.map((msg) => (
                    <div key={msg._id} className="message-card">
                      <div className="message-header">
                        <div className="message-meta">
                          <span className="message-date">
                            {new Date(msg.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className={`message-status status-${msg.status}`}>
                            {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="message-content">
                        <div className="original-message">
                          <strong>Your Message:</strong>
                          <p>{msg.message}</p>
                        </div>
                        {msg.replies && msg.replies.length > 0 && (
                          <div className="message-replies">
                            <strong>Replies:</strong>
                            {msg.replies.map((reply, index) => (
                              <div key={index} className="reply-item">
                                <div className="reply-meta">
                                  <span className="reply-admin">{reply.adminName || 'Admin'}</span>
                                  <span className="reply-date">
                                    {new Date(reply.date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="reply-content">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-messages">No messages found.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <p className='no-details'>No user details available.</p>
      )}
    </div>
  );
};

export default Info;
