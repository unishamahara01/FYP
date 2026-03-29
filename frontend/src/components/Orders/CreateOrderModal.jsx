import React from 'react';
import SearchableSelect from '../SearchableSelect';

export default function CreateOrderModal({ 
  show, 
  onClose, 
  order, 
  products,
  onChange, 
  onSubmit,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  processing,
  success
}) {
  if (!show) return null;

  const calculateTotal = () => {
    return order.items.reduce((total, item) => {
      const product = products.find(p => p._id === item.product);
      if (product) {
        const price = item.isPromoted ? product.promotionPrice : product.price;
        return total + (price * item.quantity);
      }
      return total;
    }, 0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Order</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {success ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Order Created Successfully!</h3>
            <p>The order has been processed and added to the system.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Customer Name *</label>
              <input
                type="text"
                value={order.customerName}
                onChange={(e) => onChange('customerName', e.target.value)}
                required
                disabled={processing}
              />
            </div>

            <div className="form-group">
              <label>Payment Method *</label>
              <select
                value={order.paymentMethod}
                onChange={(e) => onChange('paymentMethod', e.target.value)}
                required
                disabled={processing}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="eSewa">eSewa</option>
                <option value="Khalti">Khalti</option>
              </select>
            </div>

            <div className="form-section">
              <h3>Order Items</h3>
              {order.items.map((item, index) => (
                <div key={index} className="order-item-row">
                  <div className="form-group flex-grow">
                    <label>Product</label>
                    <SearchableSelect
                      options={products}
                      value={item.product}
                      onChange={(value) => onUpdateItem(index, 'product', value)}
                      placeholder="Select product"
                      disabled={processing}
                    />
                  </div>

                  <div className="form-group" style={{width: '120px'}}>
                    <label>Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(index, 'quantity', parseInt(e.target.value))}
                      min="1"
                      required
                      disabled={processing}
                    />
                  </div>

                  {order.items.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => onRemoveItem(index)}
                      disabled={processing}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="btn-add-item"
                onClick={onAddItem}
                disabled={processing}
              >
                + Add Item
              </button>
            </div>

            <div className="order-summary">
              <h3>Order Total: Rs {calculateTotal().toLocaleString()}</h3>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={onClose}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Create Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
