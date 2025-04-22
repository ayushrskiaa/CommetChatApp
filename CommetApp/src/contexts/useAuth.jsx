import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// Custom hook to use the auth context
const useAuth = () => useContext(AuthContext);

export default useAuth;