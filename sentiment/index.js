require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Task 1: import the natural library
const natural = require('natural');

// Task 2: initialize the express server
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Define the sentiment analysis route
// Task 3: create the POST /sentiment analysis
app.post('/sentiment', async (req, res) => {

    // Task 4: extract the sentence parameter
    const { sentence } = req.body;

    if (!sentence) {
        return res.status(400).json({ error: 'No sentence provided' });
    }

    // Initialize the sentiment analyzer with the Natural's PorterStemmer and "English" language
    const Analyzer = natural.SentimentAnalyzer;
    const stemmer = natural.PorterStemmer;
    const analyzer = new Analyzer("English", stemmer, "afinn");

    // Perform sentiment analysis
    try {
        const analysisResult = analyzer.getSentiment(sentence.split(' '));

        let sentiment = "neutral";

        // Task 5: set sentiment to negative or positive based on score rules
        if (analysisResult < 0) {
            sentiment = "negative";
        } else if (analysisResult > 0) {
            sentiment = "positive";
        }

        // Task 6: send a status code of 200 with both sentiment score and the sentiment txt
        res.status(200).json({ sentimentScore: analysisResult, sentiment: sentiment });
    } catch (error) {
        // Task 7: if there is an error, return a HTTP code of 500
        res.status(500).json({ message: 'Error performing sentiment analysis' });
    }
});

app.listen(port, () => {
    console.log(`Sentiment service running on port ${port}`);
});
