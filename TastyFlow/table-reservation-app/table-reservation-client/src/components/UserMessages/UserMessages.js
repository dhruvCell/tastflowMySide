import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import './UserMessages.css';


const UserMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserMessages = async () => {
    try {
      const userDetails = JSON.parse(localStorage.getItem('userDetails'));
      if (!userDetails || !userDetails._id) {
        message.error('User not logged in');
        navigate('/login');
        return;
      }
      const response = await fetch(`http://localhost:5000/api/message/admin/all-reviews/${userDetails._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token'),
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(data);
      } else {
        message.error(data.message || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      message.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserMessages();
  }, []);

  return (
    <div className="user-messages-container">
      <main className="user-messages-content">
        <header className="user-messages-header">
          <button onClick={() => navigate(-1)} className="user-messages-back-btn">
            Back
          </button>
          <h1>My Messages</h1>
        </header>

        {loading ? (
          <div className="user-messages-loading">Loading your messages...</div>
        ) : (
          <div className="user-messages-list">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div key={msg._id} className="user-message-card">
                  <div className="message-header">
                    <span className="message-date">
                      {new Date(msg.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className={`message-status status-${msg.status}`}>
                      {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                    </span>
                  </div>
                  <div className="message-content">
                    <strong>Your Message:</strong>
                    <p>{msg.message}</p>
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
                                  minute: '2-digit',
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
              ))
            ) : (
              <div className="user-messages-empty-state">No messages found.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserMessages;
