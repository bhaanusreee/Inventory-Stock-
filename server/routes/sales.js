const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { auth, checkRole } = require('../middleware/auth');

// Get all sales
router.get('/', auth, async (req, res) => {
    try {
        const sales = await Sale.find()
            .populate('items.product', 'name sku')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single sale
router.get('/:id', auth, async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate('items.product', 'name sku')
            .populate('createdBy', 'name');
        
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        
        res.json(sale);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create sale
router.post('/', [
    auth,
    checkRole(['admin', 'manager', 'staff']),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('paymentMethod').isIn(['cash', 'credit', 'bank_transfer']).withMessage('Invalid payment method')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check product availability
        for (const item of req.body.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({ message: `Product ${item.product} not found` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient quantity for product ${product.name}` 
                });
            }
        }

        const sale = new Sale({
            ...req.body,
            createdBy: req.user._id
        });

        await sale.save();

        // Update product quantities
        for (const item of sale.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: -item.quantity }
            });
        }

        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update sale status
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

        const sale = await Sale.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        const { status, paymentStatus } = req.body;
        
        // If cancelling a completed sale, revert product quantities
        if (status === 'cancelled' && sale.status === 'completed') {
            for (const item of sale.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { quantity: item.quantity }
                });
            }
        }
        
        // If completing a pending sale, update product quantities
        if (status === 'completed' && sale.status === 'pending') {
            for (const item of sale.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { quantity: -item.quantity }
                });
            }
        }

        sale.status = status;
        sale.paymentStatus = paymentStatus;
        await sale.save();

        res.json(sale);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete sale (admin only)
router.delete('/:id', [auth, checkRole(['admin'])], async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        // If sale was completed, revert product quantities
        if (sale.status === 'completed') {
            for (const item of sale.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { quantity: item.quantity }
                });
            }
        }

        await sale.remove();
        res.json({ message: 'Sale deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 