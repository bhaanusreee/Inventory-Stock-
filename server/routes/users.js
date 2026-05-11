const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', [auth, checkRole(['admin'])], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ name: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single user (admin only)
router.get('/:id', [auth, checkRole(['admin'])], async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user (admin only)
router.put('/:id', [
    auth,
    checkRole(['admin']),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('role').optional().isIn(['admin', 'manager', 'staff']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent updating the last admin's role
        if (user.role === 'admin' && req.body.role && req.body.role !== 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ 
                    message: 'Cannot change role of the last admin user' 
                });
            }
        }

        Object.assign(user, req.body);
        await user.save();

        res.json(user);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user password
router.put('/:id/password', [
    auth,
    checkRole(['admin']),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = req.body.password;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user (admin only)
router.delete('/:id', [auth, checkRole(['admin'])], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting the last admin
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ 
                    message: 'Cannot delete the last admin user' 
                });
            }
        }

        await user.remove();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 