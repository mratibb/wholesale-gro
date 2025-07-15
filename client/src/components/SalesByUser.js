import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';

const SalesByUser = ({ token }) => {
  const [salesByUser, setSalesByUser] = useState([]);
  const [modal, setModal] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchSalesByUser = async () => {
      try {
        const response = await axios.get('/api/sales/by-user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSalesByUser(response.data);
      } catch (err) {
        setModal({ show: true, message: 'Failed to load sales', type: 'error' });
      }
    };
    fetchSalesByUser();
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
\\begin{tabular}{|l|l|l|l|}
\\hline
\\textbf{User} & \\textbf{Item Name} & \\textbf{Buyer Name} & \\textbf{Sale Date} \\\\
\\hline
${salesByUser
  .map(user => 
    user.sales.length > 0
      ? user.sales
          .map(sale => `${user.username} & ${sale.item.name} & ${sale.buyerName} & ${new Date(sale.saleDate).toLocaleDateString()} \\\\`)
          .join('\n')
      : `${user.username} & None & None & None \\\\`
  )
  .join('\n')}
\\hline
\\end{tabular}
\\caption{Sales by User}
\\end{table}
\\end{landscape}
\\end{document}
      `;
      const response = await axios.post(
        '/api/export/pdf',
        { latexContent, filename: 'sales_by_user.pdf' },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      const url = window.URL.createObjectURL(new Blob([new Uint8Array(response.data.pdf.data)], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales_by_user.pdf');
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales by User</h2>
      <button onClick={handleExportPDF} className="btn-primary mb-4">Export as PDF</button>
      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">User</th>
              <th className="text-left p-2">Item Name</th>
              <th className="text-left p-2">Buyer Name</th>
              <th className="text-left p-2">Sale Date</th>
            </tr>
          </thead>
          <tbody>
            {salesByUser.map(user => (
              user.sales.length > 0 ? (
                user.sales.map(sale => (
                  <tr key={`${user._id}-${sale._id}`} className="border-b">
                    <td className="p-2">{user.username}</td>
                    <td className="p-2">{sale.item.name}</td>
                    <td className="p-2">{sale.buyerName}</td>
                    <td className="p-2">{new Date(sale.saleDate).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr key={user._id} className="border-b">
                  <td className="p-2">{user.username}</td>
                  <td className="p-2">None</td>
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

export default SalesByUser;