const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Get all items (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const items = await Item.find().populate('assignedTo', 'username');
    res.json(items);
  } catch (err) {
    console.error('Get items error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get items assigned to the logged-in user (normal users)
router.get('/assigned', authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ assignedTo: req.user.id }).populate('assignedTo', 'username');
    res.json(items);
  } catch (err) {
    console.error('Get assigned items error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create item (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, serialNumber, description, price } = req.body;

  if (!name || !serialNumber || !price) {
    return res.status(400).json({ message: 'Name, serial number, and price are required' });
  }

  try {
    const existingItem = await Item.findOne({ $or: [{ name }, { serialNumber }] });
    if (existingItem) {
      return res.status(400).json({ message: 'Item name or serial number already exists' });
    }

    const item = new Item({
      name,
      serialNumber,
      description,
      price: Number(price),
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign item to user (admin only)
router.put('/:id/assign', authMiddleware, adminMiddleware, async (req, res) => {
  const { userId } = req.body;

  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    item.assignedTo = userId || null;
    await item.save();
    res.json({ message: 'Item assigned successfully' });
  } catch (err) {
    console.error('Assign item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get items by user (admin only)
router.get('/by-user', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('username');
    const items = await Item.find().populate('assignedTo', 'username');
    
    const itemsByUser = users.map(user => ({
      _id: user._id,
      username: user.username || 'Unknown',
      items: items
        .filter(item => item.assignedTo && item.assignedTo._id.toString() === user._id.toString())
        .map(item => ({
          _id: item._id,
          name: item.name || 'None',
          serialNumber: item.serialNumber || 'None',
        }))
    }));
    
    res.json(itemsByUser);
  } catch (err) {
    console.error('Get items by user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;