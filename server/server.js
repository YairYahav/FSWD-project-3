// server.js - Central functionality for the calendar application

// In-memory storage (in a real application, this would be a database)
let users = {};
let userEvents = {};

export class Server {
    constructor() {
        this.initializeServerData();
    }

    // Initialize from localStorage if available
    initializeServerData() {
        users = JSON.parse(localStorage.getItem("accounts")) || {};
        userEvents = JSON.parse(localStorage.getItem("userEvents")) || {};
        
        // Save initial data to localStorage if it doesn't exist
        if (!localStorage.getItem("accounts")) {
            localStorage.setItem("accounts", JSON.stringify(users));
        }
        
        if (!localStorage.getItem("userEvents")) {
            localStorage.setItem("userEvents", JSON.stringify(userEvents));
        }
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem("accounts", JSON.stringify(users));
        localStorage.setItem("userEvents", JSON.stringify(userEvents));
    }

    // Generate response
    genResponse(status, message, data = null) {
        return {
            status: status,
            message: message,
            data: data
        };
    }

    // Authentication functions
    login(username, password) {
        // Check if user exists and password matches
        if (users[username] && users[username].password === password) {
            const token = btoa(`${username}:${Date.now()}`);
            return this.genResponse(200, "Login successful", { token, username });
        } else {
            return this.genResponse(401, "Invalid username or password");
        }
    }

    signup(username, password, email) {
        // Check if username already exists
        if (users[username]) {
            return this.genResponse(400, "Username already exists");
        }
        
        // Create new user
        users[username] = { password, email };
        this.saveData();
        return this.genResponse(201, "Account created successfully");
    }

    // Event management functions
    getEvents(username) {
        // Ensure events are initialized for this user
        if (!userEvents[username]) {
            userEvents[username] = {};
        }
        
        return this.genResponse(200, "Events retrieved successfully", userEvents[username]);
    }

    addEvent(username, event) {
        // Initialize events for user if needed
        if (!userEvents[username]) {
            userEvents[username] = {};
        }
        
        // Initialize events for date if needed
        if (!userEvents[username][event.date]) {
            userEvents[username][event.date] = [];
        }
        
        // Add the event
        userEvents[username][event.date].push(event);
        this.saveData();
        
        return this.genResponse(201, "Event added successfully", userEvents[username]);
    }

    updateEvent(username, date, eventIndex, updatedEvent) {
        // Check if user and date exist
        if (!userEvents[username] || !userEvents[username][date]) {
            return this.genResponse(404, "Event not found");
        }
        
        // Check if event index is valid
        if (eventIndex < 0 || eventIndex >= userEvents[username][date].length) {
            return this.genResponse(400, "Invalid event index");
        }
        
        // Update the event
        userEvents[username][date][eventIndex] = updatedEvent;
        this.saveData();
        
        return this.genResponse(200, "Event updated successfully", userEvents[username]);
    }

    deleteEvent(username, date, eventIndex) {
        // Check if user and date exist
        if (!userEvents[username] || !userEvents[username][date]) {
            return this.genResponse(404, "Event not found");
        }
        
        // Check if event index is valid
        if (eventIndex < 0 || eventIndex >= userEvents[username][date].length) {
            return this.genResponse(400, "Invalid event index");
        }
        
        // Remove the event
        userEvents[username][date].splice(eventIndex, 1);
        
        // Clean up empty date entries
        if (userEvents[username][date].length === 0) {
            delete userEvents[username][date];
        }
        
        this.saveData();
        
        return this.genResponse(200, "Event deleted successfully", userEvents[username]);
    }

    // Request handler
    handleRequest(method, url, body, callback) {
        console.log(`Server handling ${method} request to ${url}`);
        
        // Parse body if it's a string
        if (typeof body === 'string' && body.trim() !== '') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                console.error("Error parsing request body:", e);
                callback(this.genResponse(400, "Invalid request body"));
                return;
            }
        }
        
        // Parse the URL to determine the action
        const urlParts = url.split('/').filter(part => part);
        
        // Authentication endpoints
        if (url === '/login' && method === 'POST') {
            const result = this.login(body.username, body.password);
            callback(result);
            return;
        }
        
        if (url === '/register' && method === 'POST') {
            const result = this.signup(body.username, body.password, body.email);
            callback(result);
            return;
        }
        
        // Event endpoints
        if (urlParts[0] === 'events') {
            // Get all events for a user
            if (urlParts.length === 2 && method === 'GET') {
                const username = urlParts[1];
                const result = this.getEvents(username);
                callback(result);
                return;
            }
            
            // Add a new event
            if (urlParts.length === 1 && method === 'POST') {
                const result = this.addEvent(body.username, body.event);
                callback(result);
                return;
            }
            
            // Update an event
            if (urlParts.length === 4 && method === 'PUT') {
                const username = urlParts[1];
                const date = urlParts[2];
                const eventIndex = parseInt(urlParts[3]);
                const result = this.updateEvent(username, date, eventIndex, body.event);
                callback(result);
                return;
            }
            
            // Delete an event
            if (urlParts.length === 4 && method === 'DELETE') {
                const username = urlParts[1];
                const date = urlParts[2];
                const eventIndex = parseInt(urlParts[3]);
                const result = this.deleteEvent(username, date, eventIndex);
                callback(result);
                return;
            }
        }
        
        // If no matching endpoint was found
        callback(this.genResponse(404, "Invalid endpoint"));
    }
}