import React, { useState, useEffect } from 'react';
import { itemsAPI, beneficiaryAPI } from '../services/api';
import ItemList from './ItemList';
import ItemForm from './ItemForm';
import './BothRolesDashboard.css';

const BothRolesDashboard = () => {
  const [myItems, setMyItems] = useState([]);
  const [accessibleItems, setAccessibleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('vault'); // 'vault' or 'accessible'
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      
      // Load user's own items
      const userItemsResponse = await itemsAPI.getAll();
      setMyItems(userItemsResponse.items || userItemsResponse || []);

      // Load accessible items (released items from other users)
      const accessibleResponse = await beneficiaryAPI.getItems();
      setAccessibleItems(accessibleResponse.items || accessibleResponse || []);

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
    <div className="both-roles-dashboard">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'vault' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('vault');
            setShowForm(false);
            setEditingItem(null);
          }}
        >
          My Vault
        </button>
        <button
          className={`tab ${activeTab === 'accessible' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('accessible');
            setShowForm(false);
            setEditingItem(null);
          }}
        >
          Accessible Items
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'vault' && (
        <div className="tab-content">
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

          {showForm && (
            <ItemForm
              item={editingItem}
              onSubmit={editingItem ? (data) => handleUpdateItem(editingItem.id, data) : handleCreateItem}
              onCancel={handleCancel}
            />
          )}

          <ItemList
            items={myItems}
            onEdit={handleEdit}
            onDelete={handleDeleteItem}
            onRelease={handleReleaseItem}
            showActions={true}
          />
        </div>
      )}

      {activeTab === 'accessible' && (
        <div className="tab-content">
          <h2 className="section-title">Accessible Items</h2>
          <p className="dashboard-description">
            These are items that have been released for you to access. You have read-only access to these items.
          </p>

          <ItemList
            items={accessibleItems}
            showActions={false}
            showUserInfo={true}
          />
        </div>
      )}
    </div>
  );
};

export default BothRolesDashboard;

