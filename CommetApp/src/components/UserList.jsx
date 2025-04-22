import { useState, useEffect } from 'react';
import { getUsers } from '../services/cometchat';
import useAuth from '../contexts/useAuth';

const UserList = ({ selectedUser, onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const userList = await getUsers();
        // Filter out the current user
        const filteredUsers = userList.filter(user => user.uid !== currentUser?.uid);
        setUsers(filteredUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="users-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-error">
        <p>{error}</p>
        <button 
          className="submit-button" 
          onClick={() => window.location.reload()}
          style={{ marginTop: '1rem', maxWidth: '200px' }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="no-users">
        <p>No users found</p>
      </div>
    );
  }

  return (
    <div className="users-list">
      <h2>Contacts</h2>
      <ul>
        {users.map((user) => {
          const isSelected = selectedUser?.uid === user.uid;
          const initials = user.name 
            ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
            : user.uid.substring(0, 2).toUpperCase();
          
          return (
            <li 
              key={user.uid} 
              className={`user-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectUser(user)}
            >
              <div className="user-avatar-container">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || user.uid} className="user-avatar" />
                ) : (
                  <div className="avatar-placeholder">{initials}</div>
                )}
                <span className={`status-indicator ${user.status}`}></span> {/* Add status class: online, away, offline */}
              </div>
              <div className="user-info">
                <h3 className="user-name">{user.name || user.uid}</h3>
                <p className="user-last-message">{user.status === 'online' ? 'Online' : 'Offline'}</p>
              </div>
              <div className="user-time">2:30 PM</div> {/* Placeholder for time */}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UserList;