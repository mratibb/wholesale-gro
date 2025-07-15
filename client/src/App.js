// client/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Auth from './components/Auth';
import ItemList from './components/ItemList';
import UserManagement from './components/UserManagement';
import AddUser from './components/AddUser';
import ItemsByUser from './components/ItemsByUser';
import SalesByUser from './components/SalesByUser';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogin = (newToken, userRole) => {
    console.log('Login successful:', { newToken, userRole });
    setToken(newToken);
    setRole(userRole);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', userRole);
  };

  const handleLogout = () => {
    console.log('Logging out');
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  const isAdmin = role === 'admin';

  console.log('Rendering App, token:', token); // Debug log

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex">
        {token && isAdmin && (
          <div className="w-64 bg-white shadow-lg p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Menu</h2>
            <nav className="space-y-2">
              <Link to="/" className="sidebar-link">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
                Dashboard
              </Link>
              <Link to="/admin/add-user" className="sidebar-link">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                Add User
              </Link>
              <Link to="/admin/items-by-user" className="sidebar-link">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Items by User
              </Link>
              <Link to="/admin/sales-by-user" className="sidebar-link">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Sales by User
              </Link>
            </nav>
          </div>
        )}
        <div className="flex-1">
          <nav className="bg-blue-800 p-4 text-white flex justify-between items-center shadow-md">
            <h1 className="text-2xl font-bold">Wholesale Management</h1>
            {token && (
              <button onClick={handleLogout} className="btn-primary px-4 py-2">
                Logout
              </button>
            )}
          </nav>
          <Routes>
            <Route
              path="/login"
              element={
                <>
                  {console.log('Rendering /login route')} {/* Debug log */}
                  {token ? <Navigate to="/" /> : <Auth onLogin={handleLogin} />}
                </>
              }
            />
            <Route
              path="/admin/add-user"
              element={token && isAdmin ? <AddUser token={token} /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin/items-by-user"
              element={token && isAdmin ? <ItemsByUser token={token} /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin/sales-by-user"
              element={token && isAdmin ? <SalesByUser token={token} /> : <Navigate to="/login" />}
            />
            <Route
              path="/"
              element={
                token ? (
                  isAdmin ? (
                    <UserManagement token={token} />
                  ) : (
                    <ItemList token={token} />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;