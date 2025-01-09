const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 7000;

const url = "mongodb://127.0.0.1:27017";
const dbname = "instagram";

app.use(express.json());

let db, users;

async function initializationDatabase(){
    try{
        const client = await MongoClient.connect(url, {useUnifiedTopology:true});
        console.log("connected to Mongodb");

        db = client.db(dbname);
        users = db.collection("users");

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
app.get('/users',async (req,res) => {
    try{
        const allusers = await users.find().toArray();
        res.status(200).json(allusers); 
    } catch (err) {
        res.status(500).send("error fetching users:" + err.message);
    }
});

// GET
app.get('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; 
        const user = await users.findOne({ userId: userId }); 

        if (user) {
            res.status(200).json(user); 
        } else {
            res.status(404).send("User not found"); 
        }
    } catch (err) {
        res.status(500).send("Error fetching user: " + err.message); 
    }
});

// POST
app.post('/users',async (req,res) => {
    try{
        const newposts = req.body;
        const result = await users.insertOne(newposts);
        res.status(201).send(`courses added with ID: $(result.insertedId)`);

    } catch (err) {
        res.status(500).send("errorfetching posts:"+ err.message);
    }
});



// PATCH
app.patch('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const updateData = {};

        if (req.body.bio) {
            updateData.bio = req.body.bio;
        }
        if (req.body.profilePicture) {
            updateData.profilePicture = req.body.profilePicture;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).send("No updates provided.");
        }

        const result = await users.updateOne(
            { userId: userId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            res.status(404).send("User not found.");
        } else {
            res.status(200).send("User updated successfully.");
        }
    } catch (err) {
        res.status(500).send("Error updating user: " + err.message);
    }
});


// Delete
app.delete('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const result = await users.deleteOne({ userId: userId });

        if (result.deletedCount === 0) {
            res.status(404).send("User not found.");
        } else {
            res.status(200).send("User deleted successfully.");
        }
    } catch (err) {
        res.status(500).send("Error deleting user: " + err.message);
    }
});



