import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Modal';

const AddUser = ({ token }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [modal, setModal] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModal({ show: false, message: '', type: '' });
    setLoading(true);
    try {
      console.log('Adding user:', { username, password, email, role });
      await axios.post(
        '/api/auth/register',
        { username, password, email, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsername('');
      setPassword('');
      setEmail('');
      setRole('user');
      setModal({ show: true, message: 'User added successfully!', type: 'success' });
    } catch (err) {
      console.error('Add user error:', err.response?.data);
      setModal({ show: true, message: err.response?.data?.message || 'An error occurred', type: 'error' });
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
      <div className="card max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Add New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="Enter username"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="Enter email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Enter password"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn-primary w-full disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;