const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 6000;

const url = "mongodb://127.0.0.1:27017";
const dbname = "instagram";

app.use(express.json());

let db, stories;

async function initializationDatabase(){
    try{
        const client = await MongoClient.connect(url, {useUnifiedTopology:true});
        console.log("connected to Mongodb");

        db = client.db(dbname);
        stories = db.collection("stories");

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
app.get('/stories', async (req, res) => {
    try {
        const activeStories = await stories.find({ expiresAt: { $gte: new Date() } }).toArray(); // Fetch active stories
        res.status(200).json(activeStories); // Return active stories as JSON
    } catch (err) {
        res.status(500).send("Error fetching stories: " + err.message); // Handle error
    }
});

// DELETE
app.delete('/stories/:storyId', async (req, res) => {
    try {
        const storyId = req.params.storyId; // Get storyId from URL parameter
        const result = await stories.deleteOne({ storyId: storyId }); // Delete the story by storyId

        if (result.deletedCount === 0) {
            res.status(404).send("Story not found."); // Handle story not found
        } else {
            res.status(200).send("Story deleted successfully."); // Return success message
        }
    } catch (err) {
        res.status(500).send("Error deleting story: " + err.message); // Handle error
    }
});

// POST
app.post('/stories:',async (req,res) => {
    try{
        const newstories = req.body;
        const result = await stories.insertOne(newstories);
        res.status(201).send(`courses added with ID: $(result.insertedId)`);

    } catch (err) {
        res.status(500).send("errorfetching posts:"+ err.message);
    }
});
