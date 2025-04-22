import React, { useState, useEffect, useRef } from 'react';
import { 
  sendChatMessage as sendMessage, 
  getMessages, 
  deleteConversation,
  sendTypingIndicator,
  endTypingIndicator,
  listenForTypingIndicators,
  listenForMessages
} from '../services/cometchat';
import useAuth from '../contexts/useAuth';
import '../App.css';

const ChatWindow = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Format time from timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Fetch messages when selected user changes
  useEffect(() => {
    if (!selectedUser) return;

    const fetchChatMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const messageList = await getMessages(selectedUser.uid);
        setMessages(messageList);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchChatMessages();
  }, [selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for real-time messages and typing indicators
  useEffect(() => {
    if (!selectedUser) return;

    const listenerId = `listener_${currentUser.uid}_${selectedUser.uid}`;

    // Listen for new messages
    const removeMessageListener = listenForMessages(listenerId, (message) => {
      if (message.sender.uid === selectedUser.uid) {
        setMessages(prev => [...prev, message]);
      }
    });

    // Listen for typing indicators
    const removeTypingListener = listenForTypingIndicators(
      listenerId,
      (typingIndicator) => {
        if (typingIndicator.sender.uid === selectedUser.uid) {
          setIsTyping(true);
        }
      },
      (typingIndicator) => {
        if (typingIndicator.sender.uid === selectedUser.uid) {
          setIsTyping(false);
        }
      }
    );

    return () => {
      removeMessageListener();
      removeTypingListener();
    };
  }, [selectedUser, currentUser.uid]);

  // Handle input change with typing indicators
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    sendTypingIndicator(selectedUser.uid);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a timeout to end typing indicator after 5 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      endTypingIndicator(selectedUser.uid);
    }, 5000);
  };

  // Clear typing indicator on component unmount or when selected user changes
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (selectedUser) {
        endTypingIndicator(selectedUser.uid);
      }
    };
  }, [selectedUser]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const sentMessage = await sendMessage(selectedUser.uid, newMessage);
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  // Handle deleting a conversation
  const handleDeleteChat = async () => {
    try {
      setIsDeleting(true);
      await deleteConversation(selectedUser.uid);
      setMessages([]);
      setShowDeleteModal(false);
      setIsDeleting(false);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <h2>{selectedUser.name || selectedUser.uid}</h2>
        </div>
        <div className="messages-loading">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <h2>{selectedUser.name || selectedUser.uid}</h2>
        </div>
        <div className="messages-error">
          <p>{error}</p>
          <button 
            className="submit-button" 
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem', maxWidth: '200px' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="user-avatar" style={{ width: '36px', height: '36px', marginRight: '12px' }}>
          {selectedUser.avatar ? (
            <img src={selectedUser.avatar} alt={selectedUser.name || selectedUser.uid} />
          ) : (
            <div className="avatar-placeholder">
              {selectedUser.name 
                ? selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
                : selectedUser.uid.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <h2>
          {selectedUser.name || selectedUser.uid}
          <span className="header-status">Online</span>
        </h2>
        <button 
          className="delete-chat-button"
          onClick={() => setShowDeleteModal(true)}
          aria-label="Delete conversation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          Delete Chat
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Send a message to start the conversation!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => {
              const isSent = message.sender === currentUser.uid;
              return (
                <div 
                  key={message.id} 
                  className={`message ${isSent ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    {message.text}
                  </div>
                  <span className="message-time">
                    {formatTime(message.sentAt)}
                  </span>
                  {/* Only show reactions for your own implementation */}
                  {isSent && (
                    <div className="message-reactions">
                      <span className="reaction">👍 2</span>
                      <span className="reaction">❤️ 1</span>
                      <span className="add-reaction">+</span>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
        {/* Only show typing indicator when someone is typing */}
        {isTyping && (
          <div className="typing-indicator">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-text">{selectedUser.name || selectedUser.uid} is typing...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button type="submit" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="delete-confirmation-modal">
          <div className="delete-modal-content">
            <div className="delete-modal-header">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <h3>Delete Conversation</h3>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to delete all messages with {selectedUser.name}? This action cannot be undone.</p>
            </div>
            <div className="delete-modal-actions">
              <button 
                className="cancel-delete-button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-button"
                onClick={handleDeleteChat}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;