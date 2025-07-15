const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Item = require('../models/Item');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Get sales by user (admin only)
router.get('/by-user', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('username');
    const sales = await Sale.find().populate('user', 'username').populate('item', 'name');

    const salesByUser = users.map(user => ({
      _id: user._id,
      username: user.username || 'Unknown',
      sales: sales
        .filter(sale => sale.user && sale.user._id.toString() === user._id.toString())
        .map(sale => ({
          _id: sale._id,
          item: sale.item ? { name: sale.item.name || 'None' } : { name: 'None' },
          buyerName: sale.buyerName || 'None',
          saleDate: sale.saleDate || null,
        }))
    }));

    res.json(salesByUser);
  } catch (err) {
    console.error('Get sales by user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create sale (non-admin users)
router.post('/', authMiddleware, async (req, res) => {
  const { itemId, buyerName, saleDate } = req.body;

  if (!itemId || !buyerName || !saleDate) {
    return res.status(400).json({ message: 'Item ID, buyer name, and sale date are required' });
  }

  try {
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (!item.assignedTo || item.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Item not assigned to you' });
    }

    const sale = new Sale({
      item: itemId,
      buyerName,
      saleDate,
      user: req.user.id,
    });
    await sale.save();

    res.status(201).json({ message: 'Sale recorded successfully' });
  } catch (err) {
    console.error('Create sale error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;