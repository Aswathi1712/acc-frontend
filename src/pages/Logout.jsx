// Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout(); // clear auth token
    navigate('/login');
  }, [logout, navigate]);

  return null; // or a spinner if you want
};

export default Logout;
