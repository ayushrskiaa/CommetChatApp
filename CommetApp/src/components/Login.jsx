import { useState } from 'react';
import useAuth from '../contexts/useAuth';
import { createUser } from '../services/cometchat';

const Login = () => {
  const [uid, setUid] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!uid.trim()) {
      setError('User ID is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(uid);
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please check your User ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!uid.trim() || !name.trim()) {
      setError('User ID and Name are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createUser(uid, name);
      await login(uid);
    } catch (err) {
      console.error('SignUp error:', err);
      setError('Failed to create account. This User ID might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>CometChat</h1>
        <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
          <div className="form-group">
            <label htmlFor="uid">User ID</label>
            <input
              type="text"
              id="uid"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="Enter your user ID"
              disabled={loading}
            />
          </div>
          
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={loading}
              />
            </div>
          )}
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>
        
        <div className="auth-switch">
          {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
          <button 
            className="switch-button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            disabled={loading}
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;