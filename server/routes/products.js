const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { auth, checkRole } = require('../middleware/auth');

// Get all products
router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.find()
            .populate('supplier', 'name')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single product
router.get('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('supplier', 'name');
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create product
router.post('/', [
    auth,
    checkRole(['admin', 'manager']),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('supplier').isMongoId().withMessage('Valid supplier ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const product = new Product({
            ...req.body,
            createdBy: req.user._id
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'SKU already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update product
router.put('/:id', [
    auth,
    checkRole(['admin', 'manager']),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('sku').optional().trim().notEmpty().withMessage('SKU cannot be empty'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('supplier').optional().isMongoId().withMessage('Valid supplier ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        Object.assign(product, req.body);
        await product.save();
        
        res.json(product);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'SKU already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete product
router.delete('/:id', [auth, checkRole(['admin'])], async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.remove();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 