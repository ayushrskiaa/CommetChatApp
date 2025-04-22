import React, { useState } from 'react';
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
            onSelectUser={setSelectedUser}
          />
        </aside>

        <main className="chat-section">
          {selectedUser ? (
            <ChatWindow user={selectedUser} />
          ) : (
            <div className="empty-chat">
              <p>Select a user to start chatting</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;