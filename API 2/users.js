const express = require('express');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017";
const dbName = "youtube";

// Middleware
app.use(express.json());

let db, users;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri);
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        users = db.collection("users");

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

// Routes

// GET: List all users
app.get('/users', async (req, res) => {
    try {
        const allusers = await users.find().toArray();
        res.status(200).json(allusers);
    } catch (err) {
        res.status(500).send("Error fetching students: " + err.message);
    }
});


//GET :List or all by user id
app.get('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await users.findOne({ "userId": userId });
        res.status(200).json(user);
    } catch (err) {
        res.status(404).send("User not found");
    }
}
)

// POST: Add a new user
app.post('/users', async (req, res) => {
    try {
        // console.log();
        const newusers = req.body;
        const result = await users.insertOne(newusers);
        res.status(201).send(`courses added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding users: " + err.message);
    }
});

//PATCH /users/:userId: Update user profile picture
app.patch('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const updatedUser = req.body;
        const result = await users.updateOne({ "userId": userId }, {
            $set: updatedUser
        });
        res.status(200).send(`User updated with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(404).send("User not found");
    }
})

//DELETE /users/:userId: Delete user
app.delete('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await users.deleteOne({ "userId": userId });
        res.status(200).send(`User deleted with ID: ${result.deletedCount}`);
    }
    catch (err) {
        res.status(404).send("User not found");
    }
})