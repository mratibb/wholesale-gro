import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';

const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', serialNumber: '', description: '', price: '' });
  const [assign, setAssign] = useState({ userId: '', itemId: '' });
  const [modal, setModal] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        setModal({ show: true, message: err.response?.data?.message || 'Error fetching users', type: 'error' });
      }
    };

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

    fetchUsers();
    fetchItems();
  }, [token]);

  const handleAddItem = async () => {
    setLoading(true);
    setModal({ show: false, message: '', type: '' });
    try {
      const response = await axios.post('/api/items', newItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems([...items, response.data]);
      setNewItem({ name: '', serialNumber: '', description: '', price: '' });
      setModal({ show: true, message: 'Item added successfully!', type: 'success' });
    } catch (err) {
      setModal({ show: true, message: err.response?.data?.message || 'Error adding item', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignItem = async () => {
    if (!assign.userId || !assign.itemId) {
      setModal({ show: true, message: 'Please select both a user and an item', type: 'error' });
      return;
    }
    setLoading(true);
    setModal({ show: false, message: '', type: '' });
    try {
      console.log('Assigning:', assign);
      const response = await axios.post('/api/users/assign', assign, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(items.map((item) => (item._id === response.data._id ? response.data : item)));
      setAssign({ userId: '', itemId: '' });
      setModal({ show: true, message: 'Item assigned successfully!', type: 'success' });
    } catch (err) {
      console.error('Assign error:', err.response?.data);
      setModal({ show: true, message: err.response?.data?.message || 'Error assigning item', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setLoading(true);
    setModal({ show: false, message: '', type: '' });
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== userId));
      setModal({ show: true, message: 'User deleted successfully!', type: 'success' });
    } catch (err) {
      setModal({ show: true, message: err.response?.data?.message || 'Error deleting user', type: 'error' });
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
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Add Item</h3>
            <input
              type="text"
              placeholder="Item Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="input mb-4"
            />
            <input
              type="text"
              placeholder="Serial Number"
              value={newItem.serialNumber}
              onChange={(e) => setNewItem({ ...newItem, serialNumber: e.target.value })}
              className="input mb-4"
            />
            <input
              type="text"
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="input mb-4"
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="input mb-4"
            />
            <button
              onClick={handleAddItem}
              className="btn-primary w-full disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Assign Item to User</h3>
            <select
              value={assign.userId}
              onChange={(e) => setAssign({ ...assign, userId: e.target.value })}
              className="input mb-4"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username}
                </option>
              ))}
            </select>
            <select
              value={assign.itemId}
              onChange={(e) => setAssign({ ...assign, itemId: e.target.value })}
              className="input mb-4"
            >
              <option value="">Select Item</option>
              {items.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} {item.assignedTo ? `(Assigned to ${item.assignedTo.username})` : '(Unassigned)'}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignItem}
              className="btn-primary w-full disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Assigning...' : 'Assign Item'}
            </button>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 p-3 text-left text-gray-700 font-semibold">Username</th>
                <th className="border border-gray-200 p-3 text-left text-gray-700 font-semibold">Email</th>
                <th className="border border-gray-200 p-3 text-left text-gray-700 font-semibold">Role</th>
                <th className="border border-gray-200 p-3 text-left text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-3">{user.username}</td>
                  <td className="border border-gray-200 p-3">{user.email}</td>
                  <td className="border border-gray-200 p-3">{user.role}</td>
                  <td className="border border-gray-200 p-3">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="btn-primary px-3 py-1 text-sm disabled:opacity-50"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;