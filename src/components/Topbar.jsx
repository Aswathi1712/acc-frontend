import { useEffect, useState } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { FaBell, FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const { logout, user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('darkMode') === 'true';
    setDarkMode(stored);
    document.body.classList.toggle('bg-dark', stored);
    document.body.classList.toggle('text-white', stored);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.body.classList.toggle('bg-dark', newMode);
    document.body.classList.toggle('text-white', newMode);
  };

  const today = new Date().toLocaleDateString();

  return (
    <div className="d-flex justify-content-between align-items-center mb-3 px-3">
      {/* Left: Date */}
      <div className="fw-semibold text-muted">{today}</div>

      {/* Right: Notification + Theme + User */}
      <div className="d-flex align-items-center gap-3">

        {/* 🔔 Notifications */}
        <Dropdown align="end">
          <Dropdown.Toggle variant="link" className="text-decoration-none p-0">
            <FaBell size={20} className="text-primary" />
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ minWidth: '240px' }}>
            <Dropdown.Header>Notifications</Dropdown.Header>
            <Dropdown.Item>🔄 Invoice #1024 paid</Dropdown.Item>
            <Dropdown.Item>📩 New message from Client</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item className="text-center text-primary">View All</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {/* 🌙 Dark Mode Toggle */}
        <Form.Check
          type="switch"
          id="darkModeSwitch"
          checked={darkMode}
          onChange={toggleDarkMode}
          label={darkMode ? <FaMoon /> : <FaSun />}
        />

        {/* 🧑 User Dropdown */}
        <Dropdown align="end">
          <Dropdown.Toggle variant="link" className="p-0 text-decoration-none">
            <span
              className="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center"
              style={{ width: '32px', height: '32px', fontSize: '14px' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header>{user?.name || 'User'}</Dropdown.Header>
            <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

      </div>
    </div>
  );
};

export default Topbar;
