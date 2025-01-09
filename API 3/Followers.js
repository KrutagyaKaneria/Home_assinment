const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 6000;

const url = "mongodb://127.0.0.1:27017";
const dbname = "instagram";

app.use(express.json());

let db, followers;

async function initializationDatabase(){
    try{
        const client = await MongoClient.connect(url, {useUnifiedTopology:true});
        console.log("connected to Mongodb");

        db = client.db(dbname);
        followers = db.collection("followers");

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
app.get('/users/:userId/followers', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL parameter
        const followers = await followers.find({ followingId: userId }).toArray(); // Fetch followers based on followingId
        res.status(200).json(followers); // Return the list of followers as JSON
    } catch (err) {
        res.status(500).send("Error fetching followers: " + err.message); // Handle error
    }
});

// POST
app.post('/followers',async (req,res) => {
    try{
        const newfollowers = req.body;
        const result = await followers.insertOne(newfollowers);
        res.status(201).send(`courses added with ID: $(result.insertedId)`);

    } catch (err) {
        res.status(500).send("errorfetching posts:"+ err.message);
    }
});


// DELETE
app.delete('/followers/:followerId', async (req, res) => {
    try {
        const followerId = req.params.followerId; // Get followerId from URL parameter
        const result = await followers.deleteOne({ followerId: followerId }); // Delete the follower relationship by followerId

        if (result.deletedCount === 0) {
            res.status(404).send("Follower not found."); // Handle follower not found
        } else {
            res.status(200).send("User unfollowed successfully."); // Return success message
        }
    } catch (err) {
        res.status(500).send("Error unfollowing user: " + err.message); // Handle error
    }
});
