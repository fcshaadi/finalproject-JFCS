import React, { useState, useEffect } from 'react';
import { beneficiaryAPI } from '../services/api';
import ItemList from './ItemList';
import './BeneficiaryDashboard.css';

const BeneficiaryDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await beneficiaryAPI.getItems();
      setItems(response.items || response || []);
      setError('');
    } catch (err) {
      setError('Failed to load items. Please try again.');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="beneficiary-dashboard">
      <h2 className="section-title">Released Items</h2>
      <p className="dashboard-description">
        These are the items that have been released for you to access.
      </p>

      {error && <div className="error-message">{error}</div>}

      <ItemList
        items={items}
        showActions={false}
        showUserInfo={true}
      />
    </div>
  );
};

export default BeneficiaryDashboard;

