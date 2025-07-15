import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';

const ItemsByUser = ({ token }) => {
  const [itemsByUser, setItemsByUser] = useState([]);
  const [modal, setModal] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchItemsByUser = async () => {
      try {
        const response = await axios.get('/api/items/by-user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItemsByUser(response.data);
      } catch (err) {
        console.error('Fetch items error:', err);
        setModal({ show: true, message: 'Failed to load items', type: 'error' });
      }
    };
    fetchItemsByUser();
  }, [token]);

  const handleExportPDF = async () => {
    try {
      const latexContent = `
\\documentclass{article}
\\usepackage{geometry}
\\usepackage{pdflscape}
\\usepackage[utf8]{inputenc}
\\usepackage{noto}
\\geometry{a4paper, margin=1in}
\\begin{document}
\\begin{landscape}
\\begin{table}[h]
\\centering
\\begin{tabular}{|l|l|l|}
\\hline
\\textbf{User} & \\textbf{Item Name} & \\textbf{Serial Number} \\\\
\\hline
${itemsByUser
  .map(user => {
    const username = user.username ? user.username.replace(/&/g, '\\&') : 'Unknown';
    return user.items && user.items.length > 0
      ? user.items
          .map(item => {
            const itemName = item.name ? item.name.replace(/&/g, '\\&') : 'None';
            const serialNumber = item.serialNumber ? item.serialNumber.replace(/&/g, '\\&') : 'None';
            return `${username} & ${itemName} & ${serialNumber} \\\\`;
          })
          .join('\n')
      : `${username} & None & None \\\\`;
  })
  .join('\n')}
\\hline
\\end{tabular}
\\caption{Items by User}
\\end{table}
\\end{landscape}
\\end{document}
      `;
      const response = await axios.post(
        '/api/export/pdf',
        { latexContent, filename: 'items_by_user.pdf' },
        { 
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          responseType: 'blob'
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'items_by_user.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setModal({ show: true, message: 'PDF exported successfully', type: 'success' });
    } catch (err) {
      console.error('PDF export error:', err);
      setModal({ show: true, message: 'Failed to export PDF', type: 'error' });
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Items by User</h2>
      <button onClick={handleExportPDF} className="btn-primary mb-4">Export as PDF</button>
      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">User</th>
              <th className="text-left p-2">Item Name</th>
              <th className="text-left p-2">Serial Number</th>
            </tr>
          </thead>
          <tbody>
            {itemsByUser.map(user => (
              user.items && user.items.length > 0 ? (
                user.items.map(item => (
                  <tr key={`${user._id}-${item._id}`} className="border-b">
                    <td className="p-2">{user.username || 'Unknown'}</td>
                    <td className="p-2">{item.name || 'None'}</td>
                    <td className="p-2">{item.serialNumber || 'None'}</td>
                  </tr>
                ))
              ) : (
                <tr key={user._id} className="border-b">
                  <td className="p-2">{user.username || 'Unknown'}</td>
                  <td className="p-2">None</td>
                  <td className="p-2">None</td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemsByUser;