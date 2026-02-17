import React, { useState } from 'react';
import './ItemCard.css';

const ItemCard = ({ item, onEdit, onDelete, onRelease, showActions = true, showUserInfo = false }) => {
  const [showContent, setShowContent] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = () => {
    if (item.file_path) {
      const fileUrl = `${API_URL}${item.file_path}`;
      const token = localStorage.getItem('token');
      
      fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = item.title || 'download';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        })
        .catch((error) => {
          console.error('Error downloading file:', error);
          alert('Failed to download file. Please try again.');
        });
    }
  };

  return (
    <div className="item-card">
      <div className="item-header">
        <div className="item-title-section">
          <h3 className="item-title">{item.title}</h3>
          <div className="item-meta">
            <span>Created: {formatDate(item.created_at)}</span>
            {item.released_at && (
              <span className="released-info">
                Released: {formatDate(item.released_at)}
              </span>
            )}
            {showUserInfo && item.user_full_name && (
              <span className="user-info">From: {item.user_full_name}</span>
            )}
          </div>
          {item.is_released && (
            <span className="badge badge-success">Released</span>
          )}
          {!item.is_released && showActions && (
            <span className="badge badge-warning">Not Released</span>
          )}
        </div>
      </div>

      {item.content && (
        <div className="item-content">
          <button
            className="btn-toggle-content"
            onClick={() => setShowContent(!showContent)}
          >
            {showContent ? 'Hide Content' : 'Show Content'}
          </button>
          {showContent && (
            <div className="item-text-content">{item.content}</div>
          )}
        </div>
      )}

      {item.file_path && (
        <div className="item-file">
          <span className="file-indicator">📎 File attached</span>
          <button onClick={handleDownload} className="btn btn-secondary btn-sm">
            Download File
          </button>
        </div>
      )}

      {showActions && (
        <div className="item-actions">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="btn btn-secondary btn-sm"
            >
              Edit
            </button>
          )}
          {onRelease && !item.is_released && (
            <button
              onClick={() => onRelease(item.id)}
              className="btn btn-success btn-sm"
            >
              Release
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(item.id)}
              className="btn btn-danger btn-sm"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemCard;

