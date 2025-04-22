import { useState, useEffect } from 'react';
import { initCometChat } from './services/cometchat';
import { AuthProvider } from './contexts/AuthContext';
import useAuth from './contexts/useAuth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

// Main App wrapper with auth provider
const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState('');

  useEffect(() => {
    const setupCometChat = async () => {
      try {
        const result = await initCometChat();
        
        if (!result.success) {
          setInitError(result.error || 'Failed to initialize chat. Please check your CometChat credentials and try again.');
          return;
        }
        
        setInitError('');
      } catch (error) {
        console.error('CometChat initialization failed:', error);
        setInitError('Error initializing chat. Please check the console for details.');
      } finally {
        setInitializing(false);
      }
    };

    setupCometChat();
  }, []);

  if (initializing) {
    return <div className="initializing">Initializing chat application...</div>;
  }

  if (initError) {
    return (
      <div className="init-error">
        <h2>Initialization Error</h2>
        <p>{initError}</p>
        <p className="hint">Hint: Check if your CometChat App ID, API Key, and Region are correctly set in the .env file</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-button"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

// App content that has access to auth context
const AppContent = () => {
  const { currentUser } = useAuth();

  return (
    <div className="app">
      {currentUser ? <Dashboard /> : <Login />}
    </div>
  );
};

export default App;
