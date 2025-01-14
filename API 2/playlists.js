const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 8000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017";
const dbName = "youtube";

// Middleware
app.use(express.json());

let db, playlists;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri);
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        playlists = db.collection("playlists");

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

// GET /playlists/:userId: Fetch all playlists for a user
app.get('/playlists/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await playlists.find({ userId: userId }).toArray();

        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).send("No playlists found for this user.");
        }
    } catch (err) {
        res.status(500).send("Internal server error: " + err.message);
    }
});

// POST /playlists: Create a new playlist
app.post('/playlists', async (req, res) => {
    try {
        const newPlaylist = req.body;
        const result = await playlists.insertOne(newPlaylist);
        res.status(201).json({
            message: "Playlist created successfully",
            playlistId: result.insertedId
        });
    } catch (err) {
        res.status(500).send("Error creating playlist: " + err.message);
    }
});

// PUT /playlists/:playlistId/videos: Add a video to a playlist
app.put('/playlists/:playlistId/videos', async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const { videoId } = req.body;

        const result = await playlists.updateOne(
            { playlistId },
            { $push: { videos: videoId } }
        );

        if (result.modifiedCount > 0) {
            res.status(200).send(`Video added to playlist with ID: ${playlistId}`);
        } else {
            res.status(404).send("Playlist not found or video already exists.");
        }
    } catch (err) {
        res.status(500).send("Error adding video to playlist: " + err.message);
    }
});

// DELETE /playlists/:playlistId: Delete a playlist
app.delete('/playlists/:playlistId', async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const result = await playlists.deleteOne({ playlistId });

        if (result.deletedCount > 0) {
            res.status(200).send(`Playlist with ID: ${playlistId} deleted successfully.`);
        } else {
            res.status(404).send("Playlist not found.");
        }
    } catch (err) {
        res.status(500).send("Error deleting playlist: " + err.message);
    }
});