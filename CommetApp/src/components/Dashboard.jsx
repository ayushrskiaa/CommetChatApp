import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../contexts/useAuth';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import '../App.css';

/**
 * Dashboard component that displays the main chat interface
 * Contains the header with user info and logout button,
 * user list sidebar, and chat window
 */
const Dashboard = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { currentUser, logout } = useAuth();
  const [windowKey, setWindowKey] = useState(Date.now());

  // More robust user selection handler with useCallback to prevent recreating the function
  const handleUserSelect = useCallback((user) => {
    console.log('Dashboard: User selection started with:', user);
    
    if (!user || !user.uid) {
      console.error('Dashboard: Invalid user object received:', user);
      return;
    }
    
    // Make sure we have a clean user object with required properties
    const cleanUser = {
      uid: user.uid,
      name: user.name || user.uid,
      avatar: user.avatar || null,
      status: user.status || 'offline'
    };
    
    console.log('Dashboard: Setting selectedUser state with:', cleanUser);
    setSelectedUser(cleanUser);
    
    // Force re-render of ChatWindow by updating its key
    const newKey = Date.now();
    console.log('Dashboard: Updating windowKey to:', newKey);
    setWindowKey(newKey);
  }, []);

  // Debug effect to monitor selectedUser changes
  useEffect(() => {
    console.log('Dashboard: selectedUser state changed to:', selectedUser);
    
    // Validate the selectedUser object
    if (selectedUser) {
      if (!selectedUser.uid) {
        console.error('Dashboard: selectedUser missing uid property:', selectedUser);
      }
    }
  }, [selectedUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="app-header">
        <h1>CometChat</h1>
        <div className="user-profile">
          <span>{currentUser?.name || currentUser?.uid}</span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="chat-container">
        <aside className="sidebar">
          <UserList 
            selectedUser={selectedUser}
            onSelectUser={handleUserSelect}
          />
        </aside>

        <main className="chat-section">
          {/* Enhanced debug info */}
          <div style={{ 
            position: 'absolute', 
            top: '5px', 
            right: '5px', 
            background: selectedUser ? '#52c41a' : '#f5222d', 
            color: 'white', 
            padding: '4px 8px', 
            fontSize: '12px', 
            zIndex: 1000,
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            {/* selectedUser: {selectedUser ? 
              `${selectedUser.name} (${selectedUser.uid})` : 
              'null (not set)'
            } */}
          </div>
          
          {selectedUser ? (
            <ChatWindow key={windowKey} selectedUser={selectedUser} />
          ) : (
            <div className="empty-chat">
              <p>Select a user to start chatting</p>
              <p style={{ fontSize: '14px', marginTop: '10px', color: '#999' }}>
                Click on a user from the list or use the "Select" buttons
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;