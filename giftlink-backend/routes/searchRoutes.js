/*jshint esversion: 8 */
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

// Search for gifts
router.get('/', async (req, res, next) => {
    try {
        // Task 1: Connect to MongoDB using connectToDatabase database
        const db = await connectToDatabase();

        const collection = db.collection("gifts");

        // Initialize the query object
        let query = {};

        // Add the name filter to the query if the name parameter is not empty
        if (req.query.name) {
            query.name = { $regex: req.query.name, $options: "i" }; // Using regex for partial match, case-insensitive
        }

        // Task 3: Add other filters to the query
        if (req.query.category) {
            query.category = { $regex: req.query.category, $options: "i" };
        }
        if (req.query.condition) {
            query.condition = { $regex: req.query.condition, $options: "i" };
        }
        if (req.query.age_years) {
            query.age_years = { $lte: parseInt(req.query.age_years) };
        }

        // Task 4: Fetch filtered gifts using the find(query) method
        const gifts = await collection.find(query).toArray();

        res.json(gifts);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
