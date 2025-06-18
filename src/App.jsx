import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Customers from './pages/Customers';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';
import Invoices from './pages/Invoices';
import SalesReturns from './pages/SalesReturns';
import PurchaseInvoices from './pages/PurchaseInvoices'; // ✅ new import
import Suppliers from './pages/Suppliers';               // ✅ new import
import Receipts from './pages/Receipts';
import Payments from './pages/Payments';
import PDCs from './pages/PDCs';
import JournalVouchers from './pages/JournalVouchers';
import Layout from './components/Layout'

const App = () => {
  const { user } = useAuth();
  const location = useLocation();

  const showSidebar = user && location.pathname !== '/login';

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {showSidebar && <Sidebar />}

      <div
        className="flex-grow-1 bg-light"
        style={{
          padding: showSidebar ? '1.5rem' : '0',
          width: showSidebar ? 'calc(100% - 220px)' : '100%',
        }}
      >
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Layout>
                <Users />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <PrivateRoute>
                <Layout>
                  <Customers />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <PrivateRoute>
                <Layout>
                <Invoices />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/sales-returns"
            element={
              <PrivateRoute>
                <Layout>
                <SalesReturns />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/purchase-invoices"
            element={
              <PrivateRoute>
                <Layout>
                <PurchaseInvoices />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <PrivateRoute>
                <Layout>
                <Suppliers />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/receipts"
            element={
              <PrivateRoute>
                <Layout>
                <Receipts />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <PrivateRoute>
                <Layout>
                <Payments />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/pdcs"
            element={
              <PrivateRoute>
                <Layout>
                <PDCs />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/journal-vouchers"
            element={
              <PrivateRoute>
                <Layout>
                <JournalVouchers />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
