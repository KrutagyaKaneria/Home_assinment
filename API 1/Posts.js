const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;


const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "LinkedIn";


app.use(express.json());

let db, posts;


async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        posts = db.collection("posts");

        
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); 
    }
}

initializeDatabase();

app.get('/posts', async (req, res) => {
    try {
        const allPosts = await posts.find({}).toArray();
        
        if (allPosts.length === 0) {
            return res.status(404).json({ message: "No posts found" });
        }

        res.status(200).json(allPosts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



app.get('/posts/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        
        const post = await posts.findOne({ postId });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json(post);
    } catch (err) {
        console.error("Error fetching post:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.post('/posts', async (req, res) => {
    try {
        const { userId, content, mediaUrl, hashtags } = req.body;

        const newPost = {
            postId: `p${Date.now()}`, 
            userId,
            content,
            mediaUrl,
            likes: 0,
            comments: [],
            createdAt: new Date(),
            hashtags: hashtags || [],
        };

        await posts.insertOne(newPost);

        res.status(201).json({ message: "Post created", post: newPost });
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



app.patch('/posts/:postId/likes', async (req, res) => {
    try {
        const { postId } = req.params;
        const result = await posts.updateOne(
            { postId },
            { $inc: { likes: 1 } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({ message: "Like added to post" });
    } catch (err) {
        console.error("Error adding like:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.delete('/posts/:postId', async (req, res) => {
    try {
        const { postId } = req.params;

        const result = await posts.deleteOne({ postId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({ message: "Post deleted" });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});