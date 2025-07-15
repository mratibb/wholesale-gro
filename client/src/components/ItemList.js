import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';

const ItemList = ({ token }) => {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [buyerName, setBuyerName] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [modal, setModal] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/items', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(response.data);
      } catch (err) {
        setModal({ show: true, message: err.response?.data?.message || 'Error fetching items', type: 'error' });
      }
    };

    const fetchSales = async () => {
      try {
        const response = await axios.get('/api/items/sales', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSales(response.data);
      } catch (err) {
        setModal({ show: true, message: err.response?.data?.message || 'Error fetching sales', type: 'error' });
      }
    };

    fetchItems();
    fetchSales();
  }, [token]);

  const handleAddSale = async () => {
    if (!selectedItem || !buyerName || !saleDate) {
      setModal({ show: true, message: 'Please fill all fields', type: 'error' });
      return;
    }
    setLoading(true);
    setModal({ show: false, message: '', type: '' });
    try {
      await axios.post(
        '/api/items/sale',
        { itemId: selectedItem, buyerName, saleDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBuyerName('');
      setSaleDate('');
      setSelectedItem('');
      setModal({ show: true, message: 'Sale added successfully!', type: 'success' });
      const response = await axios.get('/api/items/sales', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales(response.data);
    } catch (err) {
      console.error('Sale error:', err.response?.data);
      setModal({ show: true, message: err.response?.data?.message || 'Error adding sale', type: 'error' });
    } finally {
      setLoading(false);
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
      <div className="card max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Items</h2>
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Add Sale</h3>
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="input mb-4"
          >
            <option value="">Select Item</option>
            {items.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} (Serial: {item.serialNumber}) - ${item.price}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Buyer Name"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            className="input mb-4"
          />
          <input
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            className="input mb-4"
          />
          <button
            onClick={handleAddSale}
            className="btn-primary w-full disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Sale'}
          </button>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Sales</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 p-3 text-left text-gray-700 font-semibold">Item Name</th>
                <th className="border border-gray-200 p-3 text-left text-gray-700 font-semibold">Serial Number</th>
                <th className="border border-gray-200 p-3 text-left text-gray-700 font-semibold">Buyer</th>
                <th className="border border-gray-200 p-3 text-left text-gray-700 font-semibold">Sale Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-3">{sale.item.name}</td>
                  <td className="border border-gray-200 p-3">{sale.item.serialNumber}</td>
                  <td className="border border-gray-200 p-3">{sale.buyerName}</td>
                  <td className="border border-gray-200 p-3">{new Date(sale.saleDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ItemList;