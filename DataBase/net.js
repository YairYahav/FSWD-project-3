// Create a Server class directly in net.js to avoid module issues
class Server {
    constructor() {
        this.initializeServerData();
    }

    // Initialize from localStorage if available
    initializeServerData() {
        this.users = JSON.parse(localStorage.getItem("accounts")) || {};
        this.userEvents = JSON.parse(localStorage.getItem("userEvents")) || {};
        
        // Save initial data to localStorage if it doesn't exist
        if (!localStorage.getItem("accounts")) {
            localStorage.setItem("accounts", JSON.stringify(this.users));
        }
        
        if (!localStorage.getItem("userEvents")) {
            localStorage.setItem("userEvents", JSON.stringify(this.userEvents));
        }
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem("accounts", JSON.stringify(this.users));
        localStorage.setItem("userEvents", JSON.stringify(this.userEvents));
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
        if (this.users[username] && this.users[username].password === password) {
            const token = btoa(`${username}:${Date.now()}`);
            return this.genResponse(200, "Login successful", { token, username });
        } else {
            return this.genResponse(401, "Invalid username or password");
        }
    }

    signup(username, password, email) {
        // Check if username already exists
        if (this.users[username]) {
            return this.genResponse(400, "Username already exists");
        }
        
        // Create new user
        this.users[username] = { password, email };
        this.saveData();
        return this.genResponse(201, "Account created successfully");
    }

    // Event management functions
    getEvents(username) {
        // Ensure events are initialized for this user
        if (!this.userEvents[username]) {
            this.userEvents[username] = {};
        }
        
        return this.genResponse(200, "Events retrieved successfully", this.userEvents[username]);
    }

    addEvent(username, event) {
        // Initialize events for user if needed
        if (!this.userEvents[username]) {
            this.userEvents[username] = {};
        }
        
        // Initialize events for date if needed
        if (!this.userEvents[username][event.date]) {
            this.userEvents[username][event.date] = [];
        }
        
        // Add the event
        this.userEvents[username][event.date].push(event);
        this.saveData();
        
        return this.genResponse(201, "Event added successfully", this.userEvents[username]);
    }

    updateEvent(username, date, eventIndex, updatedEvent) {
        // Check if user and date exist
        if (!this.userEvents[username] || !this.userEvents[username][date]) {
            return this.genResponse(404, "Event not found");
        }
        
        // Check if event index is valid
        if (eventIndex < 0 || eventIndex >= this.userEvents[username][date].length) {
            return this.genResponse(400, "Invalid event index");
        }
        
        // Update the event
        this.userEvents[username][date][eventIndex] = updatedEvent;
        this.saveData();
        
        return this.genResponse(200, "Event updated successfully", this.userEvents[username]);
    }

    deleteEvent(username, date, eventIndex) {
        // Check if user and date exist
        if (!this.userEvents[username] || !this.userEvents[username][date]) {
            return this.genResponse(404, "Event not found");
        }
        
        // Check if event index is valid
        if (eventIndex < 0 || eventIndex >= this.userEvents[username][date].length) {
            return this.genResponse(400, "Invalid event index");
        }
        
        // Remove the event
        this.userEvents[username][date].splice(eventIndex, 1);
        
        // Clean up empty date entries
        if (this.userEvents[username][date].length === 0) {
            delete this.userEvents[username][date];
        }
        
        this.saveData();
        
        return this.genResponse(200, "Event deleted successfully", this.userEvents[username]);
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

// Network class
class Network {
    constructor(dropProbability = 0.05, minDelay = 100, maxDelay = 500) {
        this.server = new Server();
        this.dropProbability = dropProbability;
        this.minDelay = minDelay;
        this.maxDelay = maxDelay;
    }

    sendRequest(method, url, body, callback) {
        // Simulate network packet loss
        if (Math.random() < this.dropProbability) {
            console.log("Network: Request dropped");
            callback(this.server.genResponse(408, "Request Timeout"));
            return;
        }

        // Simulate network delay
        let delay = Math.floor(Math.random() * (this.maxDelay - this.minDelay) + this.minDelay);
        setTimeout(() => {
            console.log(`Network: Delivering request to the server after ${delay}ms`);
            
            // Pass response back to client through callback
            this.server.handleRequest(method, url, body, (response) => {
                // Simulate response loss
                if (Math.random() < this.dropProbability) {
                    console.log("Network: Response dropped");
                    callback(this.server.genResponse(500, "Internal Server Error: Response lost"));
                    return;
                }
                callback(response);
            });
        }, delay);
    }
}

// Create a singleton instance
const networkInstance = new Network();

// Helper function to make AJAX requests using our Network class
function ajax(method, url, data, successCallback, errorCallback) {
    networkInstance.sendRequest(method, url, data, result => {
        if (result.status >= 200 && result.status < 300) {
            if (successCallback) {
                successCallback(result);
            }
        } else {
            if (errorCallback) {
                errorCallback(new Error(result.message));
            }
        }
    });
}

// Export objects to global scope to avoid module issues
window.Server = Server;
window.Network = Network;
window.ajax = ajax;
window.networkInstance = networkInstance;