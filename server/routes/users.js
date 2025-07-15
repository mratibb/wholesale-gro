const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all users (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete user (Admin only, cannot delete self)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.deleteOne({ _id: req.params.id });
    await Item.updateMany({ assignedTo: req.params.id }, { $unset: { assignedTo: '' } });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(400).json({ message: err.message });
  }
});

// Assign item to user (Admin only)
router.post('/assign', authMiddleware, adminMiddleware, async (req, res) => {
  const { userId, itemId } = req.body;
  console.log('Assign request:', { userId, itemId });
  try {
    if (!userId || !itemId) {
      return res.status(400).json({ message: 'userId and itemId are required' });
    }
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    item.assignedTo = userId;
    await item.save();
    res.json(item);
  } catch (err) {
    console.error('Error in assign:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;