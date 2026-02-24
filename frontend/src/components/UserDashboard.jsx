import React, { useState, useEffect } from 'react';
import { beneficiaryAPI, itemsAPI } from '../services/api';
import ItemList from './ItemList';
import ItemForm from './ItemForm';
import './UserDashboard.css';

const UserDashboard = () => {
  const [items, setItems] = useState([]);
  const [beneficiary, setBeneficiary] = useState(null);
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    full_name: '',
    email: '',
    password: '',
  });
  const [beneficiaryLoading, setBeneficiaryLoading] = useState(false);
  const [beneficiarySaving, setBeneficiarySaving] = useState(false);
  const [beneficiaryError, setBeneficiaryError] = useState('');
  const [beneficiaryMessage, setBeneficiaryMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadItems = async () => {
    const response = await itemsAPI.getAll();
    setItems(response.items || response || []);
  };

  const loadBeneficiary = async () => {
    setBeneficiaryLoading(true);
    const response = await beneficiaryAPI.getMyProfile();
    const linkedBeneficiary = response.beneficiary || null;
    setBeneficiary(linkedBeneficiary);
    setBeneficiaryForm({
      full_name: linkedBeneficiary?.full_name || '',
      email: linkedBeneficiary?.email || '',
      password: '',
    });
    setBeneficiaryLoading(false);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadItems(), loadBeneficiary()]);
      setError('');
    } catch (err) {
      setError('Failed to load items. Please try again.');
      setBeneficiaryError('Failed to load beneficiary. Please try again.');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBeneficiaryInputChange = (e) => {
    const { name, value } = e.target;
    setBeneficiaryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateBeneficiary = async (e) => {
    e.preventDefault();
    try {
      setBeneficiarySaving(true);
      setBeneficiaryError('');
      setBeneficiaryMessage('');

      const payload = {
        full_name: beneficiaryForm.full_name.trim(),
        email: beneficiaryForm.email.trim(),
      };
      if (beneficiaryForm.password.trim()) {
        payload.password = beneficiaryForm.password.trim();
      }

      const response = await beneficiaryAPI.updateMyProfile(payload);
      const updatedBeneficiary = response.beneficiary || null;
      setBeneficiary(updatedBeneficiary);
      setBeneficiaryForm({
        full_name: updatedBeneficiary?.full_name || '',
        email: updatedBeneficiary?.email || '',
        password: '',
      });
      setBeneficiaryMessage('Beneficiary updated successfully.');
    } catch (err) {
      setBeneficiaryError(
        err.response?.data?.message || 'Failed to update beneficiary. Please try again.',
      );
    } finally {
      setBeneficiarySaving(false);
    }
  };

  const handleUnlinkBeneficiary = async () => {
    if (
      !window.confirm(
        'Are you sure you want to unlink this beneficiary from your account?',
      )
    ) {
      return;
    }

    try {
      setBeneficiarySaving(true);
      setBeneficiaryError('');
      setBeneficiaryMessage('');
      await beneficiaryAPI.unlinkMyProfile();
      setBeneficiary(null);
      setBeneficiaryForm({
        full_name: '',
        email: '',
        password: '',
      });
      setBeneficiaryMessage('Beneficiary unlinked successfully.');
    } catch (err) {
      setBeneficiaryError(
        err.response?.data?.message || 'Failed to unlink beneficiary. Please try again.',
      );
    } finally {
      setBeneficiarySaving(false);
    }
  };

  const handleCreateItem = async (itemData) => {
    try {
      await itemsAPI.create(itemData);
      await loadDashboardData();
      setShowForm(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item. Please try again.');
    }
  };

  const handleUpdateItem = async (id, itemData) => {
    try {
      await itemsAPI.update(id, itemData);
      await loadDashboardData();
      setEditingItem(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item. Please try again.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      await itemsAPI.delete(id);
      await loadDashboardData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item. Please try again.');
    }
  };

  const handleReleaseItem = async (id) => {
    if (!window.confirm('Are you sure you want to release this item? Beneficiaries will be able to see it.')) {
      return;
    }

    try {
      await itemsAPI.release(id);
      await loadDashboardData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to release item. Please try again.');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h2 className="section-title">My Vault</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            + Create New Item
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="beneficiary-section">
        <h3>Linked Beneficiary</h3>
        {beneficiaryError && <div className="error-message">{beneficiaryError}</div>}
        {beneficiaryMessage && <div className="success-message">{beneficiaryMessage}</div>}

        {beneficiaryLoading ? (
          <div className="beneficiary-status">Loading beneficiary...</div>
        ) : !beneficiary ? (
          <div className="beneficiary-status">No beneficiary is currently linked.</div>
        ) : (
          <form className="beneficiary-form" onSubmit={handleUpdateBeneficiary}>
            <div className="form-group">
              <label htmlFor="beneficiary-full-name">Full Name</label>
              <input
                id="beneficiary-full-name"
                name="full_name"
                type="text"
                value={beneficiaryForm.full_name}
                onChange={handleBeneficiaryInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="beneficiary-email">Email</label>
              <input
                id="beneficiary-email"
                name="email"
                type="email"
                value={beneficiaryForm.email}
                onChange={handleBeneficiaryInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="beneficiary-password">
                Password (leave empty to keep current)
              </label>
              <input
                id="beneficiary-password"
                name="password"
                type="password"
                value={beneficiaryForm.password}
                onChange={handleBeneficiaryInputChange}
                minLength={8}
              />
            </div>

            <div className="beneficiary-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={beneficiarySaving}
              >
                {beneficiarySaving ? 'Saving...' : 'Update Beneficiary'}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleUnlinkBeneficiary}
                disabled={beneficiarySaving}
              >
                {beneficiarySaving ? 'Working...' : 'Unlink Beneficiary'}
              </button>
            </div>
          </form>
        )}
      </div>

      {showForm && (
        <ItemForm
          item={editingItem}
          onSubmit={editingItem ? (data) => handleUpdateItem(editingItem.id, data) : handleCreateItem}
          onCancel={handleCancel}
        />
      )}

      <ItemList
        items={items}
        onEdit={handleEdit}
        onDelete={handleDeleteItem}
        onRelease={handleReleaseItem}
        showActions={true}
      />
    </div>
  );
};

export default UserDashboard;

