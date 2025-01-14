const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 8000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017";
const dbName = "youtube";

// Middleware
app.use(express.json());

let db, videos, comments;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri);
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        videos = db.collection("videos");
        comments = db.collection("comments");

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

// GET /videos/:videoId/comments: Fetch comments for a video
app.get('/videos/:videoId/comments', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const videoComments = await comments.find({ videoId: videoId }).toArray();

        if (!videoComments || videoComments.length === 0) {
            return res.status(404).send("No comments found for the specified video.");
        }

        res.status(200).json(videoComments);
    } catch (err) {
        res.status(500).send("Internal server error: " + err.message);
    }
});

// POST /comments: Add a comment to a video
app.post('/comments', async (req, res) => {
    try {
        const newcomment = req.body;
        const result = await comments.insertOne(newcomment);
        res.status(201).json({
            message: "Comment added successfully",
            commentId: result.insert_id
        });
    } catch (err) {
        res.status(500).send("Internal server error: " + err.message);
    }
});

//PATCH /comment/:commentId: Update user profile picture
app.patch('/comments/:commentId/likes', async (req, res) => {
    try {
        const commentId = req.params.commentId;  // Get videoId from the URL parameters

        // Find the video by videoId and increment its like count
        const result = await comments.updateOne(
            { commentId: commentId },  // Find video by videoId
            { $inc: { likes: 1 } }  // Increment the 'likes' field by 1
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send("Video not found or no changes made");
        }

        res.status(200).send("Like count for video with videoId: ${videoId} updated successfully");
    } catch (err) {
        res.status(500).send("Error updating like count for video: " + err.message);
    }
});



// DELETE /comments/:commentId: Delete a comment.
app.delete('/comments/:commentId', async (req, res) => {
    try {
        const commentId = req.params.commentId; // Get commentId from URL
        const result = await comments.deleteOne({ "commentId": commentId });
        if (result.deletedCount > 0) {
            res.status(200).json({ message: "Comment deleted successfully" });
        } else {
            res.status(404).send("Comment not found");
        }
    } catch (err) {
        res.status(500).send("Internal server error: " + err.message);
    }
});