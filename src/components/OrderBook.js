// components/OrderBook.js
import React from 'react';

function OrderBook({ data }) {
  const renderOrders = (orders, type) => (
    <div className={`${type}-orders`}>
      <h4>{type === 'bids' ? 'Bids' : 'Asks'}</h4>
      <table>
        <thead>
          <tr>
            <th>Price</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 10).map((order, index) => (
            <tr key={index}>
              <td>{order.price.toFixed(2)}</td>
              <td>{order.quantity.toFixed(8)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="order-book">
      <h3>Order Book</h3>
      <div className="order-book-content">
        {renderOrders(data.bids, 'bids')}
        {renderOrders(data.asks, 'asks')}
      </div>
    </div>
  );
}

export default OrderBook;