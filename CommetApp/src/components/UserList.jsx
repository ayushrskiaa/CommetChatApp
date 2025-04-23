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
        console.log('Fetching users...');
        const userList = await getUsers();
        console.log('Users fetched:', userList);
        
        // Filter out the current user
        const filteredUsers = userList.filter(user => user.uid !== currentUser?.uid);
        console.log('Filtered users:', filteredUsers);
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

  // Improved user selection handler with direct object creation
  const handleUserSelect = (user) => {
    try {
      console.log('UserList: Attempting to select user:', user.uid);
      
      if (!user || !user.uid) {
        console.error('UserList: Invalid user object:', user);
        return;
      }
      
      // Create a clean user object with only the necessary properties
      const cleanUser = {
        uid: user.uid,
        name: user.name || user.uid,
        avatar: user.avatar || null,
        status: user.status || 'offline'
      };
      
      // Log the clean user object
      console.log('UserList: Clean user object created:', cleanUser);
      
      // Call the onSelectUser function with the clean user object
      onSelectUser(cleanUser);
      
      console.log('UserList: onSelectUser callback called successfully');
    } catch (error) {
      console.error('UserList: Error selecting user:', error);
    }
  };

  // Added method to directly select a user by creating a simpler object
  // Removed unused forceSelectUser function to resolve the error

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
              onClick={() => handleUserSelect(user)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <div className="user-avatar-container">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || user.uid} className="user-avatar" />
                ) : (
                  <div className="avatar-placeholder">{initials}</div>
                )}
                <span className={`status-indicator ${user.status || 'offline'}`}></span>
              </div>
              <div className="user-info">
                <h3 className="user-name">{user.name || user.uid}</h3>
                <p className="user-last-message">{user.status === 'online' ? 'Online' : 'Offline'}</p>
              </div>
              <div className="user-time">2:30 PM</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UserList;