const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const { auth, checkRole } = require('../middleware/auth');

// Get all purchases
router.get('/', auth, async (req, res) => {
    try {
        const purchases = await Purchase.find()
            .populate('supplier', 'name')
            .populate('items.product', 'name sku')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single purchase
router.get('/:id', auth, async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id)
            .populate('supplier', 'name')
            .populate('items.product', 'name sku')
            .populate('createdBy', 'name');
        
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }
        
        res.json(purchase);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create purchase
router.post('/', [
    auth,
    checkRole(['admin', 'manager']),
    body('supplier').isMongoId().withMessage('Valid supplier ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('paymentMethod').isIn(['cash', 'credit', 'bank_transfer']).withMessage('Invalid payment method')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const purchase = new Purchase({
            ...req.body,
            createdBy: req.user._id
        });

        await purchase.save();

        // Update product quantities
        for (const item of purchase.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: item.quantity }
            });
        }

        res.status(201).json(purchase);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update purchase status
router.patch('/:id/status', [
    auth,
    checkRole(['admin', 'manager']),
    body('status').isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('paymentStatus').isIn(['pending', 'partial', 'completed']).withMessage('Invalid payment status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const purchase = await Purchase.findById(req.params.id);
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        const { status, paymentStatus } = req.body;
        
        // If cancelling a completed purchase, revert product quantities
        if (status === 'cancelled' && purchase.status === 'completed') {
            for (const item of purchase.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { quantity: -item.quantity }
                });
            }
        }
        
        // If completing a pending purchase, update product quantities
        if (status === 'completed' && purchase.status === 'pending') {
            for (const item of purchase.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { quantity: item.quantity }
                });
            }
        }

        purchase.status = status;
        purchase.paymentStatus = paymentStatus;
        await purchase.save();

        res.json(purchase);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete purchase (admin only)
router.delete('/:id', [auth, checkRole(['admin'])], async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        // If purchase was completed, revert product quantities
        if (purchase.status === 'completed') {
            for (const item of purchase.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { quantity: -item.quantity }
                });
            }
        }

        await purchase.remove();
        res.json({ message: 'Purchase deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 