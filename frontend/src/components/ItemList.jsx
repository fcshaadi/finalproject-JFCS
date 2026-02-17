import React from 'react';
import ItemCard from './ItemCard';
import './ItemList.css';

const ItemList = ({ items, onEdit, onDelete, onRelease, showActions = true, showUserInfo = false }) => {
  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <h3>No items found</h3>
        <p>
          {showActions
            ? 'Create your first item to get started.'
            : 'No released items are available at this time.'}
        </p>
      </div>
    );
  }

  return (
    <div className="item-list">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onRelease={onRelease}
          showActions={showActions}
          showUserInfo={showUserInfo}
        />
      ))}
    </div>
  );
};

export default ItemList;

