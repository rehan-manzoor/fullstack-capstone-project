/*jshint esversion: 8 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');

const connectToDatabase = require('./models/db');
const { loadData } = require('./util/import-mongo/index');


const app = express();
app.use("*", cors());
const port = process.env.PORT || 3060;

// Connect to MongoDB; we just do this one time
connectToDatabase().then(() => {
    pinoLogger.info('Connected to DB');
})
    .catch((e) => console.error('Failed to connect to DB', e));


app.use(express.json());

// Route files
// Gift API Task 1: import the giftRoutes and store in a constant called giftroutes
const giftroutes = require('./routes/giftRoutes');

// Search API Task 1: import the searchRoutes and store in a constant called searchRoutes
const searchRoutes = require('./routes/searchRoutes');

// Auth routes
const authRoutes = require('./routes/authRoutes');

// Comment routes
const commentRoutes = require('./routes/commentRoutes');


const pinoHttp = require('pino-http');
const logger = require('./logger');

app.use(pinoHttp({ logger }));

// Use Routes
// Gift API Task 2: add the giftRoutes to the server by using the app.use() method.
app.use('/api/gifts', giftroutes);

// Search API Task 2: add the searchRoutes to the server by using the app.use() method.
app.use('/api/search', searchRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Comments routes
app.use('/api/comments', commentRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

app.get("/", (req, res) => {
    res.send("Inside the server");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
