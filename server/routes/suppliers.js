const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Supplier = require('../models/Supplier');
const { auth, checkRole } = require('../middleware/auth');

// Get all suppliers
router.get('/', auth, async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ name: 1 });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single supplier
router.get('/:id', auth, async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create supplier
router.post('/', [
    auth,
    checkRole(['admin', 'manager']),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('contactPerson').trim().notEmpty().withMessage('Contact person is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('paymentTerms').isIn(['immediate', 'net15', 'net30', 'net60']).withMessage('Invalid payment terms')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const supplier = new Supplier(req.body);
        await supplier.save();
        res.status(201).json(supplier);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update supplier
router.put('/:id', [
    auth,
    checkRole(['admin', 'manager']),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('contactPerson').optional().trim().notEmpty().withMessage('Contact person cannot be empty'),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
    body('paymentTerms').optional().isIn(['immediate', 'net15', 'net30', 'net60']).withMessage('Invalid payment terms')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        Object.assign(supplier, req.body);
        await supplier.save();
        
        res.json(supplier);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete supplier
router.delete('/:id', [auth, checkRole(['admin'])], async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        await supplier.remove();
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 