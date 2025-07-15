import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';

const SalesByUser = ({ token }) => {
  const [salesByUser, setSalesByUser] = useState([]);
  const [modal, setModal] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesByUser = async () => {
      try {
        const response = await axios.get('/api/items/sales/by-user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSalesByUser(response.data);
      } catch (err) {
        console.error('Error fetching sales by user:', err.response?.data);
        setModal({ show: true, message: err.response?.data?.message || 'Error fetching sales', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesByUser();
  }, [token]);

  const handleExportPDF = async () => {
    setLoading(true);
    setModal({ show: false, message: '', type: '' });
    try {
      const latexContent = `
\\documentclass[a4paper,12pt]{article}
\\usepackage{geometry}
\\usepackage{longtable}
\\usepackage{booktabs}
\\usepackage{pdflscape}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{noto}

\\geometry{margin=1in}
\\title{Sales by User Report}
\\author{Wholesale Management System}
\\date{${new Date().toLocaleDateString()}}

\\begin{document}
\\maketitle
\\begin{landscape}
\\section*{Sales by User}
\\begin{longtable}{p{3cm}|p{3cm}|p{3cm}|p{3cm}|p{3cm}}
\\toprule
\\textbf{User} & \\textbf{Item Name} & \\textbf{Serial Number} & \\textbf{Buyer} & \\textbf{Sale Date} \\\\
\\midrule
\\endhead
${salesByUser
  .map(
    (userGroup) =>
      userGroup.sales
        .map(
          (sale) =>
            `${
              userGroup.username || 'Unknown'
            } & ${sale.item.name} & ${sale.item.serialNumber} & ${sale.buyerName} & ${new Date(
              sale.saleDate
            ).toLocaleDateString()} \\\\`
        )
        .join('\n')
  )
  .join('\n')}
\\bottomrule
\\end{longtable}
\\end{landscape}
\\end{document}
`;
      const response = await axios.post(
        '/api/export/pdf',
        { latexContent, filename: 'sales_by_user.pdf' },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sales_by_user.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
      setModal({ show: true, message: 'Sales by User exported successfully!', type: 'success' });
    } catch (err) {
      console.error('Export error:', err.response?.data);
      setModal({ show: true, message: err.response?.data?.message || 'Error exporting PDF', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-700 text-xl">Loading...</div>
      </div>
    );
  }

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Sales by User</h2>
          <button
            onClick={handleExportPDF}
            className="btn-primary px-4 py-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Exporting...' : 'Export as PDF'}
          </button>
        </div>
        {salesByUser.length === 0 ? (
          <p className="text-gray-600">No sales recorded.</p>
        ) : (
          <div className="space-y-6">
            {salesByUser.map((userGroup) => (
              <div key={userGroup.userId} className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  {userGroup.username || 'Unknown'} ({userGroup.sales.length} sales)
                </h3>
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
                      {userGroup.sales.map((sale) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesByUser;