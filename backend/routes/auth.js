const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Required for JWT generation
// Fallback key if not provided in .env (though it should be)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        console.log('Register request:', req.body);
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            console.log('Validation failed: missing fields');
            return res.status(400).json({ msg: 'Please provide all fields' });
        }

        // Check if user exists
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            console.log('User exists:', user);
            return res.status(400).json({ msg: 'User already exists with that email or username' });
        }

        // Create new user
        user = new User({
            username,
            email,
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        console.log('Saving user:', user);

        // Save to DB
        await user.save();

        // Create JWT payload
        const payload = {
            id: user.id
        };

        // Sign token
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '7d' }, // 7 days
            (err, token) => {
                if (err) {
                    console.error('JWT sign error:', err);
                    return res.status(500).json({ msg: 'Server Error', details: 'Token generation failed' });
                }
                res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
            }
        );

    } catch (err) {
        console.error('Error in register:', err);
        console.error('Full error:', err);
        res.status(500).json({ msg: 'Server Error', details: err.message });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please provide email and password' });
        }

        // Check for existing user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create JWT payload
        const payload = {
            id: user.id
        };

        // Sign token
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) {
                    console.error('JWT sign error:', err);
                    return res.status(500).json({ msg: 'Server Error', details: 'Token generation failed' });
                }
                res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', details: err.message });
    }
});

// @route   GET api/auth/me
// @desc    Get the authenticated user's profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate({
                path: 'likedListings',
                select: 'game accountId price isActive image rank'
            })
            .populate({
                path: 'purchases',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'listingId',
                    select: 'game image rank yearsActive isActive'
                }
            });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            joinedAt: user.createdAt,
            likedCount: user.likedListings.length,
            purchaseCount: user.purchases.length,
            likedListings: user.likedListings.map((listing) => ({
                id: listing.id,
                game: listing.game,
                accountId: listing.accountId,
                price: listing.price,
                isActive: listing.isActive,
                image: listing.image,
                rank: listing.rank,
            })),
            purchases: user.purchases.map((purchase) => ({
                id: purchase.id,
                accountId: purchase.accountId,
                price: purchase.price,
                status: purchase.status,
                createdAt: purchase.createdAt,
                listing: purchase.listingId
                    ? {
                        id: purchase.listingId.id,
                        game: purchase.listingId.game,
                        image: purchase.listingId.image,
                        rank: purchase.listingId.rank,
                        yearsActive: purchase.listingId.yearsActive,
                        isActive: purchase.listingId.isActive,
                    }
                    : null,
            })),
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', details: err.message });
    }
});

module.exports = router;
