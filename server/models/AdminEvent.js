const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminEventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    venue: {
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    category: {
        type: String,
        required: true,
        enum: ['Music', 'Sports', 'Arts & Theatre', 'Family', 'Film']
    },
    imageUrl: {
        type: String,
        required: true
    },
    ticketPrice: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        }
    },
    ticketUrl: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
AdminEventSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const AdminEventModel = mongoose.model('adminEvents', AdminEventSchema);
module.exports = AdminEventModel; 