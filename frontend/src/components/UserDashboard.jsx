import React, { useState, useEffect } from 'react';
import { itemsAPI } from '../services/api';
import ItemList from './ItemList';
import ItemForm from './ItemForm';
import './UserDashboard.css';

const UserDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await itemsAPI.getAll();
      setItems(response.items || response || []);
      setError('');
    } catch (err) {
      setError('Failed to load items. Please try again.');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (itemData) => {
    try {
      await itemsAPI.create(itemData);
      await loadItems();
      setShowForm(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item. Please try again.');
    }
  };

  const handleUpdateItem = async (id, itemData) => {
    try {
      await itemsAPI.update(id, itemData);
      await loadItems();
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
      await loadItems();
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
      await loadItems();
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

