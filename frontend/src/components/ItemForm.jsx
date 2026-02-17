import React, { useState, useEffect } from 'react';
import './ItemForm.css';

const ItemForm = ({ item, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setContent(item.content || '');
      // Note: We don't pre-populate file for editing
    }
  }, [item]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Clear content when file is selected
      setContent('');
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    // Clear file when content is entered
    if (e.target.value) {
      setFile(null);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!content.trim() && !file) {
      newErrors.content = 'Either content or file must be provided';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const itemData = {
        title: title.trim(),
        content: content.trim() || null,
        file: file || null,
      };

      await onSubmit(itemData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="item-form-container">
      <form onSubmit={handleSubmit} className="item-form">
        <h3>{item ? 'Edit Item' : 'Create New Item'}</h3>

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors({ ...errors, title: '' });
              }
            }}
            required
            placeholder="Enter item title"
          />
          {errors.title && <div className="error-message">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={handleContentChange}
            placeholder="Enter text content (optional if uploading a file)"
            disabled={!!file}
          />
          {errors.content && (
            <div className="error-message">{errors.content}</div>
          )}
          {file && (
            <div className="info-message">
              File selected. Clear file to enter text content.
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="file">File</label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            disabled={!!content.trim()}
          />
          {file && (
            <div className="file-info">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
          {content.trim() && (
            <div className="info-message">
              Text content entered. Clear content to upload a file.
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;

