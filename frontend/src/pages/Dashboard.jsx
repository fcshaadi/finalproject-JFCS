import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { itemsAPI, beneficiaryAPI } from '../services/api';
import UserDashboard from '../components/UserDashboard';
import BeneficiaryDashboard from '../components/BeneficiaryDashboard';
import BothRolesDashboard from '../components/BothRolesDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { role, logout, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Dashboard is ready
    setLoading(false);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-content">
          <h1>Digital Legacy Vault</h1>
          <div className="header-actions">
            {user && (
              <span className="user-info">
                {user.full_name || user.email} ({role})
              </span>
            )}
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {error && <div className="error-message">{error}</div>}

        {role === 'user' && <UserDashboard />}
        {role === 'beneficiary' && <BeneficiaryDashboard />}
        {role === 'both' && <BothRolesDashboard />}

        {!role && (
          <div className="error-message">
            Unable to determine your role. Please contact support.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

