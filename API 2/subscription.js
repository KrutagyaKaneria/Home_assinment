const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 8000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017";
const dbName = "youtube";

// Middleware
app.use(express.json());

let db, subscriptions;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri);
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        subscriptions = db.collection("subscriptions");

        // Start server after successful DB connection
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit if database connection fails
    }
}

// Initialize Database
initializeDatabase();

// GET /subscriptions/:userId: Fetch subscriptions for a user
app.get('/subscriptions/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await subscriptions.find({ subscriber: userId }).toArray();

        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).send("No subscriptions found for this user.");
        }
    } catch (err) {
        res.status(500).send("Internal server error: " + err.message);
    }
});

// POST /subscriptions: Subscribe to a channel
app.post('/subscriptions', async (req, res) => {
    try {
        const newsub = req.body;
        const result = await subscriptions.insertOne(newsub);
        res.status(201).json({
            message: "Successfully subscribed to the channel",
            subscriptionId: result.insertedId
        });
    } catch (err) {
        res.status(500).send("Error subscribing to channel: " + err.message);
    }
});