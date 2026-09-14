/*jshint esversion: 8 */
const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../models/db');
const { authenticateUser } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET;

// ─── REGISTER ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('users');

        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        // Check if email already exists
        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already in use.' });
        }

        // Hash the password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Insert new user (never store plain-text password)
        const result = await collection.insertOne({
            name,
            email,
            password: hashedPassword,
            createdAt: new Date(),
        });

        // Issue JWT
        const token = jwt.sign(
            { userId: result.insertedId, email, name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully.',
            authToken: token,
            userName: name,
            userEmail: email,
        });
    } catch (e) {
        console.error('Registration error:', e);
        res.status(500).json({ error: 'Internal server error during registration.' });
    }
});

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('users');

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await collection.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const passwordMatch = await bcryptjs.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Issue JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful.',
            authToken: token,
            userName: user.name,
            userEmail: user.email,
        });
    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ error: 'Internal server error during login.' });
    }
});

// ─── UPDATE PROFILE ────────────────────────────────────────────────────────────
router.put('/update', authenticateUser, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('users');

        // Use the authenticated user's identity from JWT (never trust client-supplied userId)
        const email = req.user.email;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required for update.' });
        }

        await collection.updateOne({ email }, { $set: { name, updatedAt: new Date() } });

        res.json({ message: 'Profile updated successfully.', name });
    } catch (e) {
        console.error('Update profile error:', e);
        res.status(500).json({ error: 'Internal server error during profile update.' });
    }
});

// ─── GET PROFILE ───────────────────────────────────────────────────────────────
router.get('/profile', authenticateUser, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('users');

        const user = await collection.findOne(
            { email: req.user.email },
            { projection: { password: 0 } } // Never return the password
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json(user);
    } catch (e) {
        console.error('Get profile error:', e);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
