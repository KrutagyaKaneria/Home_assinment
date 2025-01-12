const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;


const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "LinkedIn";

app.use(express.json());

let db, users;


async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        users = db.collection("users");

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); 
    }
}

initializeDatabase();

app.get('/users', async (req, res) => {
    try {
        const allUsers = await users.find({}).toArray();
        res.status(200).json(allUsers);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).send("Internal Server Error");
    }
});


app.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params; 
        const user = await users.findOne({ userId });
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});


app.post('/users', async (req, res) => {
    try {
        const newUser = req.body; 
        const result = await users.insertOne(newUser);
        res.status(201).json({ message: "User created", userId: result.insertedId });
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});


app.patch('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { headline } = req.body; 
        const result = await users.updateOne(
            { userId }, 
            { $set: { headline } } 
        );
        if (result.matchedCount === 0) {
            return res.status(404).send("User not found");
        }
        res.status(200).json({ message: "User headline updated" });
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});


app.delete('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params; 
        const result = await users.deleteOne({ userId });
        if (result.deletedCount === 0) {
            return res.status(404).send("User not found");
        }
        res.status(200).json({ message: "User deleted" });
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});
