const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'completed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'credit', 'bank_transfer'],
        required: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    customerPhone: {
        type: String,
        trim: true
    },
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Calculate total amount before saving
saleSchema.pre('save', function(next) {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.quantity * item.price);
    }, 0);
    next();
});

module.exports = mongoose.model('Sale', saleSchema); 