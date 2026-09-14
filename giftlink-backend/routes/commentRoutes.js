/*jshint esversion: 8 */
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');
const { authenticateUser } = require('../middleware/auth');
const axios = require('axios');
const { ObjectId } = require('mongodb');

const SENTIMENT_URL = process.env.SENTIMENT_URL || 'http://localhost:3000';

// ─── GET COMMENTS FOR A GIFT ───────────────────────────────────────────────────
router.get('/:giftId', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('comments');
        const comments = await collection.find({ giftId: req.params.giftId }).toArray();
        res.json(comments);
    } catch (e) {
        console.error('Error fetching comments:', e);
        res.status(500).json({ error: 'Error fetching comments.' });
    }
});

// ─── ADD A COMMENT (authenticated) ────────────────────────────────────────────
router.post('/:giftId', authenticateUser, async (req, res) => {
    try {
        const { comment } = req.body;

        if (!comment || !comment.trim()) {
            return res.status(400).json({ error: 'Comment text is required.' });
        }

        // Call sentiment analysis service
        let sentiment = 'neutral';
        let sentimentScore = 0;
        try {
            const sentimentResponse = await axios.post(`${SENTIMENT_URL}/sentiment`, {
                sentence: comment,
            });
            sentiment = sentimentResponse.data.sentiment || 'neutral';
            sentimentScore = sentimentResponse.data.sentimentScore || 0;
        } catch (sentimentError) {
            console.warn('Sentiment service unavailable, defaulting to neutral.');
        }

        const db = await connectToDatabase();
        const collection = db.collection('comments');

        const newComment = {
            giftId: req.params.giftId,
            author: req.user.name || req.user.email,
            comment: comment.trim(),
            sentiment,
            sentimentScore,
            createdAt: new Date(),
        };

        const result = await collection.insertOne(newComment);
        res.status(201).json({ ...newComment, _id: result.insertedId });
    } catch (e) {
        console.error('Error adding comment:', e);
        res.status(500).json({ error: 'Error adding comment.' });
    }
});

module.exports = router;
