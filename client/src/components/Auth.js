// client/src/components/Auth.js
import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Modal';

const Auth = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [modal, setModal] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModal({ show: false, message: '', type: '' });
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      onLogin(response.data.token, response.data.role);
    } catch (err) {
      console.error('Login error:', err.response?.data);
      setModal({ show: true, message: err.response?.data?.message || 'Login failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {modal.show && (
        <Modal
          message={modal.message}
          type={modal.type}
          onClose={() => setModal({ show: false, message: '', type: '' })}
        />
      )}
      <div className="card max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h2>
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
          <div className="mb-6">
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
          <button
            type="submit"
            className="btn-primary w-full disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;