const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;


const uri = "mongodb://127.0.0.1:27017"; 
const dbName = "LinkedIn";


app.use(express.json());

let db, messages;


async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        messages = db.collection("messages");

        
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); 
    }
}


initializeDatabase();




app.post('/messages', async (req, res) => {
    try {
        const { from, to, content } = req.body;

        const newMessage = {
            messageId: `m${Date.now()}`,  
            from,
            to,
            content,
            sentAt: new Date(),
        };

        await messages.insertOne(newMessage);

        res.status(201).json({ message: "Message sent", message: newMessage });
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.delete('/messages/:messageId', async (req, res) => {
    try {
        const { messageId } = req.params;

        const result = await messages.deleteOne({ messageId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json({ message: "Message deleted" });
    } catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.get('/messages/:messageId', async (req, res) => {
    try {
        const { messageId } = req.params;
        const userMessages = await messages.find({ messageId }).toArray();
        if (userMessages.length === 0) {
            return res.status(404).json({ message: "No messages found" });
        }
        res.status(200).json(userMessages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});