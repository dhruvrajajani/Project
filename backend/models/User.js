const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    likedListings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MarketplaceListing'
        }
    ],
    purchases: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Purchase'
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
