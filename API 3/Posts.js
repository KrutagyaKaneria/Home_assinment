const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 7000;

const url = "mongodb://127.0.0.1:27017";
const dbname = "instagram";

app.use(express.json());

let db, posts;

async function initializationDatabase(){
    try{
        const client = await MongoClient.connect(url, {useUnifiedTopology:true});
        console.log("connected to Mongodb");

        db = client.db(dbname);
        posts = db.collection("posts");

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
app.get('/posts',async (req,res) => {
    try{
        const allposts = await posts.find().toArray();
        res.status(200).json(allposts); 
    } catch (err) {
        res.status(500).send("error fetching posts:" + err.message);
    }
});


// GET
app.get('/posts/:postId', async (req, res) => {
    try {
        const postId = req.params.postId; 
        const post = await posts.findOne({ postId: postId });
        if (post) {
            res.status(200).json(post); 
        } else {
            res.status(404).send("Post not found"); 
        }
    } catch (err) {
        res.status(500).send("Error fetching post: " + err.message); 
    }
});


// POST
app.post('/posts',async (req,res) => {
    try{
        const newposts = req.body;
        const result = await posts.insertOne(newposts);
        res.status(201).send(`courses added with ID: $(result.insertedId)`);

    } catch (err) {
        res.status(500).send("errorfetching posts:"+ err.message);
    }
});

// PATCH
app.patch('/posts/:postId/caption', async (req, res) => {
    try {
        const postId = req.params.postId; 
        const { caption } = req.body; 
        if (!caption) {
            return res.status(400).send("Caption is required to update.");
        }
        const result = await posts.updateOne(
            { postId: postId }, 
            { $set: { caption: caption } } 
        );
        if (result.matchedCount === 0) {
            res.status(404).send("Post not found.");
        } else if (result.modifiedCount === 0) {
            res.status(200).send("Caption is already up to date.");
        } else {
            res.status(200).send("Caption updated successfully.");
        }
    } catch (err) {
        res.status(500).send("Error updating caption: " + err.message);
    }
});







// delete
app.delete('/posts/:postId', async (req, res) => {
    try {
        const postId = req.params.postId; 
        const result = await posts.deleteOne({ postId: postId });
        if (result.deletedCount === 0) {
            res.status(404).send("Post not found.");
        } else {
            res.status(200).send("Post deleted successfully.");
        }
    } catch (err) {
        res.status(500).send("Error deleting post: " + err.message);
    }
});
