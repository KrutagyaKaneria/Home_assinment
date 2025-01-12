const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;


const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "LinkedIn";


app.use(express.json());

let db, connections;


async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        connections = db.collection("connections");

      
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); 
    }
}


initializeDatabase();
app.get('/connections/:connectionId', async (req, res) => {
    try {
        const { connectionId } = req.params;
        const userConnections = await connections.find({ connectionId }).toArray();

        if (userConnections.length === 0) {
            return res.status(404).json({ message: "No connections found for this user" });
        }

        res.status(200).json(userConnections);
    } catch (err) {
        console.error("Error fetching connections:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.post('/connections', async (req, res) => {
    try {
        const { user1, user2 } = req.body; 
        const existingConnection = await connections.findOne({ user1, user2 });
        if (existingConnection) {
            return res.status(400).json({ message: "Connection request already exists" });
        }

      
        const newConnection = {
            connectionId: `c${Date.now()}`,  
            user1,
            user2,
            status: "pending",
        };

        
        await connections.insertOne(newConnection);
        res.status(201).json({ message: "Connection request sent", connection: newConnection });
    } catch (err) {
        console.error("Error sending connection request:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.patch('/connections/:connectionId', async (req, res) => {
    try {
        const { connectionId } = req.params; 
        const updatedConnection = await connections.updateOne(
            { connectionId }, 
            { $set: { status: "connected" } }
        );

        if (updatedConnection.matchedCount === 0) {
            return res.status(404).json({ message: "Connection request not found" });
        }

        res.status(200).json({ message: "Connection request accepted" });
    } catch (err) {
        console.error("Error accepting connection request:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



app.delete('/connections/:connectionId', async (req, res) => {
    try {
        const { connectionId } = req.params;
        const deleteResult = await connections.deleteOne({ connectionId });

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ message: "Connection not found" });
        }

        res.status(200).json({ message: "Connection removed" });
    } catch (err) {
        console.error("Error removing connection:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});