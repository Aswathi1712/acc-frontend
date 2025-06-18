import { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Button, Dropdown, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBell } from 'react-icons/fa'; // Font Awesome


const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [time, setTime] = useState(new Date());

  const toggleDark = () => setDarkMode(!darkMode);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notify = () => toast.info('You have 2 new messages');

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={darkMode ? 'bg-dark text-white min-vh-100' : 'bg-light text-dark min-vh-100'}>
      <Navbar className={darkMode ? 'bg-secondary' : 'bg-white'} expand="lg" sticky="top">
        <Container fluid>
          <Navbar.Brand className="fw-bold text-primary">📘 Accounting App</Navbar.Brand>
          <Nav className="ms-auto align-items-center gap-3">
            <Form.Check
              type="switch"
              id="dark-mode-switch"
              label={darkMode ? 'Dark' : 'Light'}
              checked={darkMode}
              onChange={toggleDark}
            />

          <span onClick={notify} className="position-relative me-3" style={{ cursor: 'pointer' }}>
  <FaBell size={20} className="text-primary" />
</span>


            <span className="text-muted small">{time.toLocaleTimeString()}</span>

            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                {user?.name || 'Account'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate('/profile')}>Profile</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Container>
      </Navbar>

      <Container fluid className="p-4">
        {children}
      </Container>

      <ToastContainer position="top-right" autoClose={4000} hideProgressBar newestOnTop pauseOnHover />
    </div>
  );
};

export default Layout;
