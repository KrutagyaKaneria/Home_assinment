const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 6000;

const url = "mongodb://127.0.0.1:27017";
const dbname = "instagram";

app.use(express.json());

let db, comments;

async function initializationDatabase(){
    try{
        const client = await MongoClient.connect(url, {useUnifiedTopology:true});
        console.log("connected to Mongodb");

        db = client.db(dbname);
        comments = db.collection("comments");

        app.listen(port, () => {
            console.log(`server running at http ://localhost:{port}`);
        });
    } catch(err) {
        console.error("error connecting to mongodb",err);
        process.exit(1);
    }
}

initializationDatabase();

// GET
app.get('/posts/:postId/comments', async (req, res) => {
    try {
        const postId = req.params.postId;
        const comments = await comments.find({ postId: postId }).toArray();
        if (comments.length === 0) {
            res.status(404).send("No comments found for this post.");
        } else {
            res.status(200).json(comments);
        }
    } catch (err) {
        res.status(500).send("Error fetching comments: " + err.message);
    }
});


// POST
app.post('/comments',async (req,res) => {
    try{
        const newcomments = req.body;
        const result = await comments.insertOne(newcomments);
        res.status(201).send(`courses added with ID: $(result.insertedId)`);

    } catch (err) {
        res.status(500).send("errorfetching posts:"+ err.message);
    }
});


// PATCH
app.patch('/comments/:commentId/likes', async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const result = await comments.updateOne(
            { commentId: commentId },
            { $inc: { likes: 1 } }
        );
        if (result.matchedCount === 0) {
            res.status(404).send("Comment not found.");
        } else {
            res.status(200).send("Likes incremented successfully.");
        }
    } catch (err) {
        res.status(500).send("Error incrementing likes: " + err.message);
    }
});


// DELETE
app.delete('/comments/:commentId', async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const result = await comments.deleteOne({ commentId: commentId });
        if (result.deletedCount === 0) {
            res.status(404).send("Comment not found.");
        } else {
            res.status(200).send("Comment deleted successfully.");
        }
    } catch (err) {
        res.status(500).send("Error deleting comment: " + err.message);
    }
});


