import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaUserTie,
  FaFileInvoiceDollar,
  FaUndoAlt,
  FaTruck,
  FaFileInvoice,
  FaReceipt,
  FaCreditCard ,
  FaMoneyCheckAlt ,
  FaBook// NEW: Icon for Payments
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/users', label: 'Users', icon: <FaUsers /> },
    { path: '/customers', label: 'Customers', icon: <FaUserTie /> },
    { path: '/suppliers', label: 'Suppliers', icon: <FaTruck /> },
    { path: '/invoices', label: 'Sales Invoices', icon: <FaFileInvoiceDollar /> },
    { path: '/sales-returns', label: 'Sales Returns', icon: <FaUndoAlt /> },
    { path: '/purchase-invoices', label: 'Purchase Invoices', icon: <FaFileInvoice /> },
    { path: '/receipts', label: 'Receipts', icon: <FaReceipt /> },
    { path: '/payments', label: 'Payments', icon: <FaCreditCard /> } ,
    { path: '/pdcs', label: 'PDC', icon: <FaMoneyCheckAlt /> },
    { path: '/journal-vouchers', label: 'Journal Vouchers', icon: <FaBook /> } // NEW ITEM
  ];

  return (
    <div className="bg-white shadow-sm p-3 vh-100" style={{ width: '240px' }}>
      <h5 className="mb-4 text-primary fw-bold">📘 Accounting</h5>
      <Nav className="flex-column">
        {navItems.map(({ path, label, icon }) => (
          <Nav.Link
            as={Link}
            to={path}
            key={path}
            active={location.pathname === path}
            className={`d-flex align-items-center gap-2 mb-2 rounded ${
              location.pathname === path ? 'bg-primary text-white' : 'text-dark'
            }`}
            style={{ padding: '10px 12px', fontWeight: '500' }}
          >
            {icon}
            {label}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;
