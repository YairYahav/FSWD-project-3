import {BD} from "../DataBase/database.js";

const User = {
//    "id": 1,
    "username": "exampleA",
    "password": "6969", //hashedd password
    "email" : "a@a.com"
}
const events = {
    "title": "", // we need to aloow 2 meetings at the same timr so it will be our key' the rest is optionl
    "startTime": "",
    "endTime": "",
    "description": "",
    "date": "" 
}

export class Server {
    constructor() {
        this.userDB = new DB("$users$");
        this.meetingDB = new DB("$meetings$");
    }


    Response(status, msg){
        return JSON.stringify({status: status, message: msg});
    }
    

    getUserbyID(body) {
        if (body.hasOwnProperty("username")){
            let data = this.userDB.getByKey(body.username);
            if (!(body.hasOwnProperty("password") && data.password == body.password)){
                data = {username: data.username, password:body.password, email: data.email};
            } else {
                data = {username: data.username, password:body.password, email: data.email, data: data.data};
            }
            if (!data)
                return this.Response(404, "User does not exist!");
            return this.Response(200, "Ok");
            
        }
        return this.getUser();
    }

    getUser() {
        return this.Response(403, "Access is denied");
    }


    login(body){
        if(body.hasOwnProperty("username") && body.hasOwnProperty("password")){
            let user = JSON.parse(this.getUserByKey(body))
            if(user.status == 200)
            {
                if (body.user == user.data.username && body.password == user.data.password)
                {
                    let newId = this.addSession(body.username);
                    return this.Response(200, "Ok")
                }
            }
        }
        return this.Response(403, "username or password is invalid!");
    }


    handleRequest(method, url, body, callback) {
        body = JSON.parse(body);
        if(url=="/users"){
            if(method == "GET")
            {
                if(body)
                    callback(this.getUserbyID(body));
                else
                    callback(this.getUser());
            } 
            else if(method == "POST")
            {
                callback(this.userPost(body));
            } 
            else if(method == "PUT")
            {
                callback(this.userPut(body));
            } 
            else if(method == "DELETE")
            {
                callback(this.UserDelete(body));
            } 
            else 
            {
                callback(this.Response(400, "Bad Request: Unsupported operation"));
            }
        }


        else if (url == "/event") 
        {
            if (method == "GET")
            {
                if(body)
                    callback(this.getUserbyID(body));
            }
            else if(method == "POST"){
                callback(this.userPost(body));
            } 
            else if(method == "PUT"){
                callback(this.userPut(body));
            } 
            else if(method == "DELETE"){
                callback(this.DeleteUser(body));
            } 
            else 
            {
                callback(this.Response(400, "Bad Request: Unsupported operation"));
            }
        }

    }







}












/*

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, "database.json");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("static")); // Serve static files

// Initialize database.json if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
    console.log('Created empty database.json file');
}

// Load the database
function loadDatabase() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading database file:", error);
        // If there's an error, initialize with empty structure
        return { users: [] };
    }
}

// Save the database
function saveDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error("Error writing to database file:", error);
        return false;
    }
}

// ===== USER ROUTES =====

// Register new user
app.post("/register", async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        
        let db = loadDatabase();

        // Check if username already exists
        if (db.users.find(user => user.username === username)) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        db.users.push({ 
            username, 
            password: hashedPassword, 
            email: email || "",
            events: [] 
        });
        
        // Save updated database
        const saved = saveDatabase(db);
        if (!saved) {
            return res.status(500).json({ message: "Server error: Could not save data" });
        }

        console.log(`User registered: ${username}`);
        return res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Server error during registration", error: error.message });
    }
});

// Login user
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        
        let db = loadDatabase();
        let user = db.users.find(user => user.username === username);

        // Check if user exists and password matches
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        console.log(`User logged in: ${username}`);
        return res.status(200).json({ message: "Login successful!" });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error during login", error: error.message });
    }
});

// ===== EVENT ROUTES =====

// Get all events for a user
app.get("/events/:username", (req, res) => {
    try {
        const username = req.params.username;
        
        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }
        
        let db = loadDatabase();
        let user = db.users.find(user => user.username === username);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user.events);
    } catch (error) {
        console.error("Error getting events:", error);
        return res.status(500).json({ message: "Server error getting events", error: error.message });
    }
});

// Add a new event for a user
app.post("/events", (req, res) => {
    try {
        const { username, event } = req.body;
        
        if (!username || !event) {
            return res.status(400).json({ message: "Username and event details are required" });
        }
        
        let db = loadDatabase();
        let userIndex = db.users.findIndex(user => user.username === username);

        if (userIndex === -1) {
            return res.status(404).json({ message: "User not found" });
        }

        // Add event with unique ID
        const newEvent = {
            ...event,
            id: Date.now().toString() // Simple unique ID
        };
        
        db.users[userIndex].events.push(newEvent);
        
        const saved = saveDatabase(db);
        if (!saved) {
            return res.status(500).json({ message: "Server error: Could not save data" });
        }

        return res.status(201).json({ message: "Event added successfully!", event: newEvent });
    } catch (error) {
        console.error("Error adding event:", error);
        return res.status(500).json({ message: "Server error adding event", error: error.message });
    }
});

// Update an event
app.put("/events/:username/:date/:eventIndex", (req, res) => {
    try {
        const { username, date, eventIndex } = req.params;
        const { event } = req.body;
        
        if (!username || !date || eventIndex === undefined || !event) {
            return res.status(400).json({ message: "Missing required parameters" });
        }
        
        let db = loadDatabase();
        let userIndex = db.users.findIndex(user => user.username === username);

        if (userIndex === -1) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = db.users[userIndex];
        
        // Find events for the specific date
        const dayEvents = user.events.filter(e => e.date === date);
        
        if (parseInt(eventIndex) >= dayEvents.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Find the original event in the user's events array
        const eventPosition = user.events.findIndex(e => 
            e.date === date && 
            e.name === dayEvents[parseInt(eventIndex)].name && 
            e.startTime === dayEvents[parseInt(eventIndex)].startTime
        );

        if (eventPosition === -1) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Update the event
        db.users[userIndex].events[eventPosition] = {
            ...event,
            id: user.events[eventPosition].id // Keep the original ID
        };
        
        const saved = saveDatabase(db);
        if (!saved) {
            return res.status(500).json({ message: "Server error: Could not save data" });
        }

        return res.status(200).json({ message: "Event updated successfully!" });
    } catch (error) {
        console.error("Error updating event:", error);
        return res.status(500).json({ message: "Server error updating event", error: error.message });
    }
});

// Delete an event
app.delete("/events/:username/:date/:eventIndex", (req, res) => {
    try {
        const { username, date, eventIndex } = req.params;
        
        if (!username || !date || eventIndex === undefined) {
            return res.status(400).json({ message: "Missing required parameters" });
        }
        
        let db = loadDatabase();
        let userIndex = db.users.findIndex(user => user.username === username);

        if (userIndex === -1) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = db.users[userIndex];
        
        // Find events for the specific date
        const dayEvents = user.events.filter(e => e.date === date);
        
        if (parseInt(eventIndex) >= dayEvents.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Find the original event in the user's events array
        const eventPosition = user.events.findIndex(e => 
            e.date === date && 
            e.name === dayEvents[parseInt(eventIndex)].name && 
            e.startTime === dayEvents[parseInt(eventIndex)].startTime
        );

        if (eventPosition === -1) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Remove the event
        db.users[userIndex].events.splice(eventPosition, 1);
        
        const saved = saveDatabase(db);
        if (!saved) {
            return res.status(500).json({ message: "Server error: Could not save data" });
        }

        return res.status(200).json({ message: "Event deleted successfully!" });
    } catch (error) {
        console.error("Error deleting event:", error);
        return res.status(500).json({ message: "Server error deleting event", error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Database location: ${DB_FILE}`);
});


*/