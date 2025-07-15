import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';

const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({ show: false, message: '', type: '' });
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, itemsRes, currentUserRes] = await Promise.all([
          axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/items', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/users/me', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUsers(usersRes.data);
        setItems(itemsRes.data);
        setCurrentUserId(currentUserRes.data._id);
      } catch (err) {
        console.error('Error fetching data:', err);
        setModal({ show: true, message: 'Failed to load data', type: 'error' });
      }
    };
    fetchData();
  }, [token]);

  const handleAssignItem = async (userId, itemId) => {
    try {
      await axios.put(
        `/api/items/${itemId}/assign`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(items.map(item => item._id === itemId ? { ...item, assignedTo: userId } : item));
      setModal({ show: true, message: 'Item assigned successfully', type: 'success' });
    } catch (err) {
      setModal({ show: true, message: err.response?.data?.message || 'Failed to assign item', type: 'error' });
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const serialNumber = e.target.serialNumber.value;
    const description = e.target.description.value;
    const price = e.target.price.value;

    try {
      const response = await axios.post(
        '/api/items',
        { name, serialNumber, description, price: Number(price) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems([...items, response.data]);
      setModal({ show: true, message: 'Item added successfully', type: 'success' });
      e.target.reset();
    } catch (err) {
      setModal({ show: true, message: err.response?.data?.message || 'Failed to add item', type: 'error' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUserId) {
      setModal({ show: true, message: 'Cannot delete your own account', type: 'error' });
      return;
    }
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter(user => user._id !== userId));
      setItems(items.map(item => item.assignedTo === userId ? { ...item, assignedTo: null } : item));
      setModal({ show: true, message: 'User deleted successfully', type: 'success' });
    } catch (err) {
      setModal({ show: true, message: err.response?.data?.message || 'Failed to delete user', type: 'error' });
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Add Item</h3>
        <form onSubmit={handleAddItem} className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Item Name</label>
              <input name="name" className="input" placeholder="Enter item name" required />
            </div>
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Serial Number</label>
              <input name="serialNumber" className="input" placeholder="Enter serial number" required />
            </div>
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Description</label>
              <input name="description" className="input" placeholder="Enter description" />
            </div>
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Price</label>
              <input name="price" type="number" className="input" placeholder="Enter price" required />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4">Add Item</button>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Users</h3>
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Username</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Assign Item</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b">
                  <td className="p-2">{user.username}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.role}</td>
                  <td className="p-2">
                    <select
                      className="input"
                      onChange={(e) => handleAssignItem(user._id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Select an item</option>
                      {items
                        .filter(item => !item.assignedTo || item.assignedTo === user._id)
                        .map(item => (
                          <option key={item._id} value={item._id}>
                            {item.name} ({item.serialNumber})
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="btn-danger"
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