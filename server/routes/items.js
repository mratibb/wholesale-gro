const express = require('express');
const Item = require('../models/Item');
const Sale = require('../models/Sale');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all items (Admins get all items with populated assignedTo, users get only their assigned items)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let items;
    if (req.user.role === 'admin') {
      items = await Item.find().populate('assignedTo', 'username');
    } else {
      items = await Item.find({ assignedTo: req.user.id });
    }
    res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get items grouped by user (Admin only)
router.get('/by-user', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const items = await Item.find().populate('assignedTo', 'username');
    const groupedItems = {};
    items.forEach((item) => {
      const userId = item.assignedTo ? item.assignedTo._id.toString() : 'unassigned';
      const username = item.assignedTo ? item.assignedTo.username : 'Unassigned';
      if (!groupedItems[userId]) {
        groupedItems[userId] = { userId, username, items: [] };
      }
      groupedItems[userId].items.push(item);
    });
    res.json(Object.values(groupedItems));
  } catch (err) {
    console.error('Error fetching items by user:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get sales grouped by user (Admin only)
router.get('/sales/by-user', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const sales = await Sale.find().populate('item').populate('user', 'username');
    const groupedSales = {};
    sales.forEach((sale) => {
      const userId = sale.user ? sale.user._id.toString() : 'unknown';
      const username = sale.user ? sale.user.username : 'Unknown';
      if (!groupedSales[userId]) {
        groupedSales[userId] = { userId, username, sales: [] };
      }
      groupedSales[userId].sales.push(sale);
    });
    res.json(Object.values(groupedSales));
  } catch (err) {
    console.error('Error fetching sales by user:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add item (Admin only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  try {
    const { name, serialNumber, description, price } = req.body;
    if (!name || !serialNumber || !price) {
      return res.status(400).json({ message: 'Name, serial number, and price are required' });
    }
    const existingItem = await Item.findOne({ $or: [{ name }, { serialNumber }] });
    if (existingItem) {
      return res.status(400).json({
        message: existingItem.name === name ? 'Item name already exists' : 'Serial number already exists',
      });
    }
    const item = new Item({ name, serialNumber, description, price });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(400).json({ message: err.message });
  }
});

// Record sale
router.post('/sale', authMiddleware, async (req, res) => {
  try {
    const { itemId, buyerName, saleDate } = req.body;
    const item = await Item.findById(itemId);
    if (!item || item.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to sell this item' });
    }
    const sale = new Sale({ item: itemId, buyerName, saleDate, user: req.user.id });
    await sale.save();
    res.status(201).json(sale);
  } catch (err) {
    console.error('Error adding sale:', err);
    res.status(400).json({ message: err.message });
  }
});

// Get sales for user
router.get('/sales', authMiddleware, async (req, res) => {
  try {
    const sales = await Sale.find({ user: req.user.id }).populate('item');
    res.json(sales);
  } catch (err) {
    console.error('Error fetching sales:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;