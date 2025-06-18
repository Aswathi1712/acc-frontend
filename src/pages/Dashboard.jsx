import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const Dashboard = () => {
  const salesData = [
    { day: 'Mon', sales: 1200 },
    { day: 'Tue', sales: 2100 },
    { day: 'Wed', sales: 800 },
    { day: 'Thu', sales: 1600 },
    { day: 'Fri', sales: 900 },
    { day: 'Sat', sales: 2400 },
    { day: 'Sun', sales: 1800 },
  ];

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold text-primary">📊 Business Dashboard</h2>

      {/* Cards */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white shadow h-100">
            <div className="card-body">
              <h6>Total Stock Value</h6>
              <h4 className="fw-bold">$52,300</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white shadow h-100">
            <div className="card-body">
              <h6>Total Sales (This Week)</h6>
              <h4 className="fw-bold">$12,700</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white shadow h-100">
            <div className="card-body">
              <h6>Total Purchases</h6>
              <h4 className="fw-bold">$7,800</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-white shadow h-100">
            <div className="card-body">
              <h6>Pending Orders</h6>
              <h4 className="fw-bold">18 Orders</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-danger text-white shadow h-100">
            <div className="card-body">
              <h6>Low Stock Alerts</h6>
              <h4 className="fw-bold">5 Products</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-dark text-white shadow h-100">
            <div className="card-body">
              <h6>Profit / Loss</h6>
              <h4 className="fw-bold text-success">+$3,200</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card shadow-sm mt-5">
        <div className="card-body">
          <h5 className="card-title text-primary">📈 Weekly Sales Trend</h5>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#4facfe" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
