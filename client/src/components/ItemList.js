import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';

const ItemList = ({ token, user }) => {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [modal, setModal] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/items/assigned', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(response.data);
      } catch (err) {
        console.error('Fetch items error:', err);
        setModal({ show: true, message: 'Error fetching items', type: 'error' });
      }
    };

    const fetchSales = async () => {
      try {
        const response = await axios.get('/api/sales/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSales(response.data);
      } catch (err) {
        console.error('Fetch sales error:', err);
        setModal({ show: true, message: 'Error fetching sales', type: 'error' });
      }
    };

    fetchItems();
    fetchSales();
  }, [token]);

  const handleAddSale = async (itemId) => {
    const buyerName = prompt('Enter buyer name:');
    if (!buyerName) return;

    try {
      await axios.post(
        '/api/sales',
        { itemId, buyerName, saleDate: new Date() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModal({ show: true, message: 'Sale recorded successfully', type: 'success' });
      // Refresh sales
      const response = await axios.get('/api/sales/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales(response.data);
    } catch (err) {
      console.error('Add sale error:', err);
      setModal({ show: true, message: 'Failed to record sale', type: 'error' });
    }
  };

  return (
    <div className="p-6">
      {modal.show && (
        <Modal
          message={modal.message}
          type={modal.type}
          onClose={() => setModal({ show: false, message: '', type: '' })}
        />
      )}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Items</h2>
      <div className="card mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Item Name</th>
              <th className="text-left p-2">Serial Number</th>
              <th className="text-left p-2">Price</th>
              <th className="text-left p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id} className="border-b">
                <td className="p-2">{item.name || 'None'}</td>
                <td className="p-2">{item.serialNumber || 'None'}</td>
                <td className="p-2">${item.price || 0}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleAddSale(item._id)}
                    className="btn-primary"
                  >
                    Record Sale
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Sales</h2>
      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Item Name</th>
              <th className="text-left p-2">Buyer Name</th>
              <th className="text-left p-2">Sale Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale._id} className="border-b">
                <td className="p-2">{sale.item && sale.item.name ? sale.item.name : 'None'}</td>
                <td className="p-2">{sale.buyerName || 'None'}</td>
                <td className="p-2">{sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'None'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemList;