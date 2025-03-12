// import {BD} from "../DataBase/database.js";

// const User = {
// //    "id": 1,
//     "username": "exampleA",
//     "password": "6969", //hashedd password
//     "email" : "a@a.com"
// }
// const events = {
//     "title": "", // we need to aloow 2 meetings at the same timr so it will be our key' the rest is optionl
//     "startTime": "",
//     "endTime": "",
//     "description": "",
//     "date": "" 
// }

// export class Server {
//     constructor() {
//         this.userDB = new DB("$users$");
//         this.meetingDB = new DB("$meetings$");
//     }


//     Response(status, msg){
//         return JSON.stringify({status: status, message: msg});
//     }
    

//     getUserbyID(body) {
//         if (body.hasOwnProperty("username")){
//             let data = this.userDB.getByKey(body.username);
//             if (!(body.hasOwnProperty("password") && data.password == body.password)){
//                 data = {username: data.username, password:body.password, email: data.email};
//             } else {
//                 data = {username: data.username, password:body.password, email: data.email, data: data.data};
//             }
//             if (!data)
//                 return this.Response(404, "User does not exist!");
//             return this.Response(200, "Ok");
            
//         }
//         return this.getUser();
//     }

//     getUser() {
//         return this.Response(403, "Access is denied");
//     }


//     login(body){
//         if(body.hasOwnProperty("username") && body.hasOwnProperty("password")){
//             let user = JSON.parse(this.getUserByKey(body))
//             if(user.status == 200)
//             {
//                 if (body.user == user.data.username && body.password == user.data.password)
//                 {
//                     let newId = this.addSession(body.username);
//                     return this.Response(200, "Ok")
//                 }
//             }
//         }
//         return this.Response(403, "username or password is invalid!");
//     }


//     handleRequest(method, url, body, callback) {
//         body = JSON.parse(body);
//         if(url=="/users"){
//             if(method == "GET")
//             {
//                 if(body)
//                     callback(this.getUserbyID(body));
//                 else
//                     callback(this.getUser());
//             } 
//             else if(method == "POST")
//             {
//                 callback(this.userPost(body));
//             } 
//             else if(method == "PUT")
//             {
//                 callback(this.userPut(body));
//             } 
//             else if(method == "DELETE")
//             {
//                 callback(this.UserDelete(body));
//             } 
//             else 
//             {
//                 callback(this.Response(400, "Bad Request: Unsupported operation"));
//             }
//         }


//         else if (url == "/event") 
//         {
//             if (method == "GET")
//             {
//                 if(body)
//                     callback(this.getUserbyID(body));
//             }
//             else if(method == "POST"){
//                 callback(this.userPost(body));
//             } 
//             else if(method == "PUT"){
//                 callback(this.userPut(body));
//             } 
//             else if(method == "DELETE"){
//                 callback(this.DeleteUser(body));
//             } 
//             else 
//             {
//                 callback(this.Response(400, "Bad Request: Unsupported operation"));
//             }
//         }

//     }



// }












// /*

// const express = require("express");
// const cors = require("cors");
// const fs = require("fs");
// const path = require("path");
// const bcrypt = require("bcrypt");

// const app = express();
// const PORT = 3000;
// const DB_FILE = path.join(__dirname, "database.json");

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.static("static")); // Serve static files

// // Initialize database.json if it doesn't exist
// if (!fs.existsSync(DB_FILE)) {
//     fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
//     console.log('Created empty database.json file');
// }

// // Load the database
// function loadDatabase() {
//     try {
//         const data = fs.readFileSync(DB_FILE, 'utf8');
//         return JSON.parse(data);
//     } catch (error) {
//         console.error("Error reading database file:", error);
//         // If there's an error, initialize with empty structure
//         return { users: [] };
//     }
// }

// // Save the database
// function saveDatabase(data) {
//     try {
//         fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
//         return true;
//     } catch (error) {
//         console.error("Error writing to database file:", error);
//         return false;
//     }
// }

// // ===== USER ROUTES =====

// // Register new user
// app.post("/register", async (req, res) => {
//     try {
//         const { username, password, email } = req.body;
        
//         // Validate input
//         if (!username || !password) {
//             return res.status(400).json({ message: "Username and password are required" });
//         }
        
//         let db = loadDatabase();

//         // Check if username already exists
//         if (db.users.find(user => user.username === username)) {
//             return res.status(400).json({ message: "Username already exists" });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);
        
//         // Create new user
//         db.users.push({ 
//             username, 
//             password: hashedPassword, 
//             email: email || "",
//             events: [] 
//         });
        
//         // Save updated database
//         const saved = saveDatabase(db);
//         if (!saved) {
//             return res.status(500).json({ message: "Server error: Could not save data" });
//         }

//         console.log(`User registered: ${username}`);
//         return res.status(201).json({ message: "User registered successfully!" });
//     } catch (error) {
//         console.error("Registration error:", error);
//         return res.status(500).json({ message: "Server error during registration", error: error.message });
//     }
// });

// // Login user
// app.post("/login", async (req, res) => {
//     try {
//         const { username, password } = req.body;
        
//         // Validate input
//         if (!username || !password) {
//             return res.status(400).json({ message: "Username and password are required" });
//         }
        
//         let db = loadDatabase();
//         let user = db.users.find(user => user.username === username);

//         // Check if user exists and password matches
//         if (!user) {
//             return res.status(401).json({ message: "Invalid username or password" });
//         }

//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             return res.status(401).json({ message: "Invalid username or password" });
//         }

//         console.log(`User logged in: ${username}`);
//         return res.status(200).json({ message: "Login successful!" });
//     } catch (error) {
//         console.error("Login error:", error);
//         return res.status(500).json({ message: "Server error during login", error: error.message });
//     }
// });

// // ===== EVENT ROUTES =====

// // Get all events for a user
// app.get("/events/:username", (req, res) => {
//     try {
//         const username = req.params.username;
        
//         if (!username) {
//             return res.status(400).json({ message: "Username is required" });
//         }
        
//         let db = loadDatabase();
//         let user = db.users.find(user => user.username === username);

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         return res.status(200).json(user.events);
//     } catch (error) {
//         console.error("Error getting events:", error);
//         return res.status(500).json({ message: "Server error getting events", error: error.message });
//     }
// });

// // Add a new event for a user
// app.post("/events", (req, res) => {
//     try {
//         const { username, event } = req.body;
        
//         if (!username || !event) {
//             return res.status(400).json({ message: "Username and event details are required" });
//         }
        
//         let db = loadDatabase();
//         let userIndex = db.users.findIndex(user => user.username === username);

//         if (userIndex === -1) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Add event with unique ID
//         const newEvent = {
//             ...event,
//             id: Date.now().toString() // Simple unique ID
//         };
        
//         db.users[userIndex].events.push(newEvent);
        
//         const saved = saveDatabase(db);
//         if (!saved) {
//             return res.status(500).json({ message: "Server error: Could not save data" });
//         }

//         return res.status(201).json({ message: "Event added successfully!", event: newEvent });
//     } catch (error) {
//         console.error("Error adding event:", error);
//         return res.status(500).json({ message: "Server error adding event", error: error.message });
//     }
// });

// // Update an event
// app.put("/events/:username/:date/:eventIndex", (req, res) => {
//     try {
//         const { username, date, eventIndex } = req.params;
//         const { event } = req.body;
        
//         if (!username || !date || eventIndex === undefined || !event) {
//             return res.status(400).json({ message: "Missing required parameters" });
//         }
        
//         let db = loadDatabase();
//         let userIndex = db.users.findIndex(user => user.username === username);

//         if (userIndex === -1) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         const user = db.users[userIndex];
        
//         // Find events for the specific date
//         const dayEvents = user.events.filter(e => e.date === date);
        
//         if (parseInt(eventIndex) >= dayEvents.length) {
//             return res.status(404).json({ message: "Event not found" });
//         }

//         // Find the original event in the user's events array
//         const eventPosition = user.events.findIndex(e => 
//             e.date === date && 
//             e.name === dayEvents[parseInt(eventIndex)].name && 
//             e.startTime === dayEvents[parseInt(eventIndex)].startTime
//         );

//         if (eventPosition === -1) {
//             return res.status(404).json({ message: "Event not found" });
//         }

//         // Update the event
//         db.users[userIndex].events[eventPosition] = {
//             ...event,
//             id: user.events[eventPosition].id // Keep the original ID
//         };
        
//         const saved = saveDatabase(db);
//         if (!saved) {
//             return res.status(500).json({ message: "Server error: Could not save data" });
//         }

//         return res.status(200).json({ message: "Event updated successfully!" });
//     } catch (error) {
//         console.error("Error updating event:", error);
//         return res.status(500).json({ message: "Server error updating event", error: error.message });
//     }
// });

// // Delete an event
// app.delete("/events/:username/:date/:eventIndex", (req, res) => {
//     try {
//         const { username, date, eventIndex } = req.params;
        
//         if (!username || !date || eventIndex === undefined) {
//             return res.status(400).json({ message: "Missing required parameters" });
//         }
        
//         let db = loadDatabase();
//         let userIndex = db.users.findIndex(user => user.username === username);

//         if (userIndex === -1) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         const user = db.users[userIndex];
        
//         // Find events for the specific date
//         const dayEvents = user.events.filter(e => e.date === date);
        
//         if (parseInt(eventIndex) >= dayEvents.length) {
//             return res.status(404).json({ message: "Event not found" });
//         }

//         // Find the original event in the user's events array
//         const eventPosition = user.events.findIndex(e => 
//             e.date === date && 
//             e.name === dayEvents[parseInt(eventIndex)].name && 
//             e.startTime === dayEvents[parseInt(eventIndex)].startTime
//         );

//         if (eventPosition === -1) {
//             return res.status(404).json({ message: "Event not found" });
//         }

//         // Remove the event
//         db.users[userIndex].events.splice(eventPosition, 1);
        
//         const saved = saveDatabase(db);
//         if (!saved) {
//             return res.status(500).json({ message: "Server error: Could not save data" });
//         }

//         return res.status(200).json({ message: "Event deleted successfully!" });
//     } catch (error) {
//         console.error("Error deleting event:", error);
//         return res.status(500).json({ message: "Server error deleting event", error: error.message });
//     }
// });

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
//     console.log(`Database location: ${DB_FILE}`);
// });


// */


// server.js - Central functionality for the calendar application

// In-memory storage (in a real application, this would be a database)
let users = JSON.parse(localStorage.getItem("accounts")) || {};
let userEvents = {};

// Initialize from localStorage if available
function initializeServerData() {
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
function saveData() {
  localStorage.setItem("accounts", JSON.stringify(users));
  localStorage.setItem("userEvents", JSON.stringify(userEvents));
}

// Authentication functions
function handleLogin(username, password) {
  // Check if user exists and password matches
  if (users[username] && users[username].password === password) {
    const token = btoa(`${username}:${Date.now()}`);
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('currentUser', username);
    return { success: true, token: token, message: "Login successful" };
  } else {
    return { success: false, message: "Invalid username or password" };
  }
}

function handleSignup(username, password, email) {
  // Check if username already exists
  if (users[username]) {
    return { success: false, message: "Username already exists" };
  }
  
  // Create new user
  users[username] = { password, email };
  saveData();
  return { success: true, message: "Account created successfully" };
}

function handleLogout() {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('currentUser');
  return { success: true, message: "Logged out successfully" };
}

function verifyAuth() {
  const token = sessionStorage.getItem('authToken');
  const username = sessionStorage.getItem('currentUser');
  
  if (!token || !username || !users[username]) {
    return false;
  }
  
  return true;
}

// Event management functions
function getEvents(username) {
  // Ensure events are initialized for this user
  if (!userEvents[username]) {
    userEvents[username] = {};
  }
  
  return userEvents[username];
}

function addEvent(username, event) {
  if (!verifyAuth() || sessionStorage.getItem('currentUser') !== username) {
    return { success: false, message: "Authentication required" };
  }
  
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
  saveData();
  
  return { 
    success: true, 
    message: "Event added successfully",
    events: userEvents[username]
  };
}

function updateEvent(username, date, eventIndex, updatedEvent) {
  if (!verifyAuth() || sessionStorage.getItem('currentUser') !== username) {
    return { success: false, message: "Authentication required" };
  }
  
  // Check if user and date exist
  if (!userEvents[username] || !userEvents[username][date]) {
    return { success: false, message: "Event not found" };
  }
  
  // Check if event index is valid
  if (eventIndex < 0 || eventIndex >= userEvents[username][date].length) {
    return { success: false, message: "Invalid event index" };
  }
  
  // Update the event
  userEvents[username][date][eventIndex] = updatedEvent;
  saveData();
  
  return { 
    success: true, 
    message: "Event updated successfully",
    events: userEvents[username]
  };
}

function deleteEvent(username, date, eventIndex) {
  if (!verifyAuth() || sessionStorage.getItem('currentUser') !== username) {
    return { success: false, message: "Authentication required" };
  }
  
  // Check if user and date exist
  if (!userEvents[username] || !userEvents[username][date]) {
    return { success: false, message: "Event not found" };
  }
  
  // Check if event index is valid
  if (eventIndex < 0 || eventIndex >= userEvents[username][date].length) {
    return { success: false, message: "Invalid event index" };
  }
  
  // Remove the event
  userEvents[username][date].splice(eventIndex, 1);
  
  // Clean up empty date entries
  if (userEvents[username][date].length === 0) {
    delete userEvents[username][date];
  }
  
  saveData();
  
  return { 
    success: true, 
    message: "Event deleted successfully",
    events: userEvents[username]
  };
}

// AJAX request handler - simulates server endpoints
function handleAjaxRequest(method, url, data, callback) {
  // Simulate network delay
  setTimeout(() => {
    // Parse the URL to determine the action
    const urlParts = url.split('/').filter(part => part);
    
    // Authentication endpoints
    if (url === '/login' && method === 'POST') {
      const result = handleLogin(data.username, data.password);
      callback(result);
      return;
    }
    
    if (url === '/register' && method === 'POST') {
      const result = handleSignup(data.username, data.password, data.email);
      callback(result);
      return;
    }
    
    if (url === '/logout' && method === 'POST') {
      const result = handleLogout();
      callback(result);
      return;
    }
    
    // Event endpoints
    if (urlParts[0] === 'events') {
      // Get all events for a user
      if (urlParts.length === 2 && method === 'GET') {
        const username = urlParts[1];
        const events = getEvents(username);
        callback({ success: true, events: events });
        return;
      }
      
      // Add a new event
      if (urlParts.length === 1 && method === 'POST') {
        const result = addEvent(data.username, data.event);
        callback(result);
        return;
      }
      
      // Update an event
      if (urlParts.length === 4 && method === 'PUT') {
        const username = urlParts[1];
        const date = urlParts[2];
        const eventIndex = parseInt(urlParts[3]);
        const result = updateEvent(username, date, eventIndex, data.event);
        callback(result);
        return;
      }
      
      // Delete an event
      if (urlParts.length === 4 && method === 'DELETE') {
        const username = urlParts[1];
        const date = urlParts[2];
        const eventIndex = parseInt(urlParts[3]);
        const result = deleteEvent(username, date, eventIndex);
        callback(result);
        return;
      }
    }
    
    // If no matching endpoint was found
    callback({ success: false, message: "Invalid endpoint" });
  }, 100);  // Small delay to simulate server request
}

// Helper function to make AJAX requests
function ajax(method, url, data) {
  return new Promise((resolve, reject) => {
    handleAjaxRequest(method, url, data, result => {
      if (result.success) {
        resolve(result);
      } else {
        reject(new Error(result.message));
      }
    });
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeServerData();
  
  // Check if we're on the login page
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const username = document.getElementById("login-username").value;
      const password = document.getElementById("login-password").value;
      
      try {
        const result = await ajax('POST', '/login', { username, password });
        alert("Login successful! Redirecting...");
        window.location.href = "home.html";
      } catch (error) {
        alert(`Login failed: ${error.message}`);
      }
    });
  }
  
  // Check if we're on the signup page
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const username = document.getElementById("signup-username").value;
      const password = document.getElementById("signup-password").value;
      const email = document.getElementById("signup-email").value;
      
      try {
        const result = await ajax('POST', '/register', { username, password, email });
        alert("Account created successfully! Redirecting to login...");
        window.location.href = "login.html";
      } catch (error) {
        alert(`Registration failed: ${error.message}`);
      }
    });
  }
  
  // Check if we're on the home page
  const calendarElement = document.getElementById("calendar");
  if (calendarElement) {
    // Initialize calendar functionality
    initializeCalendar();
  }
});

// Calendar functionality
function initializeCalendar() {
  // These elements should be on the home page
  const prevMonthButton = document.getElementById('prev-month');
  const nextMonthButton = document.getElementById('next-month');
  const calendarMonthElement = document.getElementById('calendar-month');
  const calendarElement = document.getElementById('calendar');
  const addEventButton = document.getElementById('add-event');
  const eventListElement = document.getElementById('event-list');
  
  // Day Modal elements
  const dayModal = document.getElementById('day-modal');
  const closeDayModalButton = document.getElementById('close-day-modal');
  const modalDateElement = document.getElementById('modal-date');
  const modalEventsElement = document.getElementById('modal-events');
  const addNewEventButton = document.getElementById('add-new-event');
  
  // Event Modal elements
  const addEventModal = document.getElementById('add-event-modal');
  const closeAddEventModalButton = document.getElementById('close-add-event-modal');
  const addEventForm = document.getElementById('add-event-form');
  
  // Edit Event Modal elements
  const editEventModal = document.getElementById('edit-event-modal');
  const closeEditEventModalButton = document.getElementById('close-edit-event-modal');
  const editEventForm = document.getElementById('edit-event-form');
  
  // Current state variables
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  let currentUsername = sessionStorage.getItem('currentUser');
  let events = {};
  
  // Button event handlers
  prevMonthButton.addEventListener('click', () => changeMonth(-1));
  nextMonthButton.addEventListener('click', () => changeMonth(1));
  addEventButton.addEventListener('click', () => addEventModal.style.display = 'flex');
  closeDayModalButton.addEventListener('click', () => dayModal.style.display = 'none');
  closeAddEventModalButton.addEventListener('click', () => addEventModal.style.display = 'none');
  closeEditEventModalButton.addEventListener('click', () => editEventModal.style.display = 'none');
  addNewEventButton.addEventListener('click', () => addEventModal.style.display = 'flex');
  
  // Check if user is logged in
  if (!verifyAuth()) {
    window.location.href = "login.html";
    return;
  }
  
  // Fetch events for the current user
  fetchUserEvents();
  
  // Event form handlers
  addEventForm.addEventListener('submit', handleAddEvent);
  editEventForm.addEventListener('submit', handleEditEvent);
  
  // Change the current month
  function changeMonth(direction) {
    currentMonth += direction;
    
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    } else if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    
    updateCalendar();
  }
  
  // Fetch events for the current user
  async function fetchUserEvents() {
    if (!currentUsername) return;
    
    try {
      const result = await ajax('GET', `/events/${currentUsername}`, null);
      events = result.events || {};
      updateCalendar();
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }
  
  // Update Calendar
  function updateCalendar() {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    calendarMonthElement.textContent = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' }) + " " + currentYear;
    
    calendarElement.innerHTML = '';
    
    // Add days header
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < weekdays.length; i++) {
      const weekdayElement = document.createElement('div');
      weekdayElement.textContent = weekdays[i];
      weekdayElement.classList.add('weekdays');
      calendarElement.appendChild(weekdayElement);
    }
    
    // Add empty days before start of month
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      calendarElement.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.textContent = day;
      
      // Format date as YYYY-MM-DD
      const formattedDay = day < 10 ? '0' + day : day;
      const formattedMonth = (currentMonth + 1) < 10 ? '0' + (currentMonth + 1) : (currentMonth + 1);
      const currentDay = `${currentYear}-${formattedMonth}-${formattedDay}`;
      
      if (events[currentDay] && events[currentDay].length > 0) {
        dayElement.classList.add('event');
        dayElement.setAttribute('title', events[currentDay].map(e => e.name).join(', '));
      }
      
      dayElement.addEventListener('click', () => showDayModal(currentDay));
      calendarElement.appendChild(dayElement);
    }
  }
  
  // Show Day Modal
  function showDayModal(day) {
    const dayEvents = events[day] || [];
    
    modalDateElement.textContent = day;
    modalEventsElement.innerHTML = '';
    
    if (dayEvents.length === 0) {
      modalEventsElement.innerHTML = 'No events today yet.';
    } else {
      dayEvents.forEach((event, index) => {
        const eventBox = document.createElement('div');
        eventBox.classList.add('event-box');
        
        const eventElement = document.createElement('div');
        eventElement.textContent = event.name;
        
        const eventTimeElement = document.createElement('div');
        eventTimeElement.textContent = `${event.startTime} - ${event.endTime || 'N/A'}`;
        eventTimeElement.classList.add('event-time');
        
        eventElement.classList.add('event');
        eventElement.appendChild(eventTimeElement);
        
        eventElement.addEventListener('click', () => showEventDetails(event, day, index));
        modalEventsElement.appendChild(eventElement);
      });
    }
    
    dayModal.style.display = 'flex';
  }
  
  // Show event details in the modal
  function showEventDetails(event, day, index) {
    const eventDetails = document.createElement('div');
    eventDetails.innerHTML = `
      <h4>${event.name}</h4>
      <p>Start Time: ${event.startTime}</p>
      ${event.endTime ? `<p>End Time: ${event.endTime}</p>` : ''}
      ${event.description ? `<p>Description: ${event.description}</p>` : ''}
      <button id="edit-event-btn">Edit</button>
      <button id="delete-event-btn">Delete</button>
    `;
    
    modalEventsElement.innerHTML = '';
    modalEventsElement.appendChild(eventDetails);
    
    // Add event listeners for edit and delete buttons
    document.getElementById('edit-event-btn').addEventListener('click', () => {
      openEditEventModal(event, day, index);
    });
    
    document.getElementById('delete-event-btn').addEventListener('click', () => {
      deleteEvent(day, index);
    });
  }
  
  // Open the edit event modal
  function openEditEventModal(event, day, index) {
    document.getElementById('edit-event-name').value = event.name;
    document.getElementById('edit-event-start-time').value = event.startTime;
    document.getElementById('edit-event-end-time').value = event.endTime || '';
    document.getElementById('edit-event-description').value = event.description || '';
    
    editEventModal.style.display = 'flex';
    
    // Store the current event and day for the edit form handler
    window.currentEventForEdit = {
      event: event,
      day: day,
      index: index
    };
  }
  
  // Handle add event form submission
  async function handleAddEvent(e) {
    e.preventDefault();
    
    if (!currentUsername) {
      alert('Please log in to add events');
      return;
    }
    
    const eventName = document.getElementById('event-name').value;
    const startTime = document.getElementById('event-start-time').value;
    const endTime = document.getElementById('event-end-time').value;
    const description = document.getElementById('event-description').value;
    const selectedDate = modalDateElement.textContent;
    
    const newEvent = {
      name: eventName,
      startTime: startTime,
      endTime: endTime || null,
      description: description || null,
      date: selectedDate
    };
    
    try {
      const result = await ajax('POST', '/events', {
        username: currentUsername,
        event: newEvent
      });
      
      // Update local events cache
      events = result.events;
      
      // Update UI
      updateCalendar();
      showDayModal(selectedDate);
      
      // Close the modal
      addEventModal.style.display = 'none';
      
      // Reset form
      addEventForm.reset();
    } catch (error) {
      console.error('Error adding event:', error);
      alert(`Failed to add event: ${error.message}`);
    }
  }
  
  // Handle edit event form submission
  async function handleEditEvent(e) {
    e.preventDefault();
    
    if (!currentUsername || !window.currentEventForEdit) {
      return;
    }
    
    const { day, index } = window.currentEventForEdit;
    
    const eventName = document.getElementById('edit-event-name').value;
    const startTime = document.getElementById('edit-event-start-time').value;
    const endTime = document.getElementById('edit-event-end-time').value;
    const description = document.getElementById('edit-event-description').value;
    
    const updatedEvent = {
      name: eventName,
      startTime: startTime,
      endTime: endTime || null,
      description: description || null,
      date: day
    };
    
    try {
      const result = await ajax('PUT', `/events/${currentUsername}/${day}/${index}`, {
        event: updatedEvent
      });
      
      // Update local events cache
      events = result.events;
      
      // Update UI
      updateCalendar();
      showDayModal(day);
      
      // Close the modal
      editEventModal.style.display = 'none';
    } catch (error) {
      console.error('Error updating event:', error);
      alert(`Failed to update event: ${error.message}`);
    }
  }
  
  // Delete an event
  async function deleteEvent(day, index) {
    if (!currentUsername) return;
    
    try {
      const result = await ajax('DELETE', `/events/${currentUsername}/${day}/${index}`, null);
      
      // Update local events cache
      events = result.events;
      
      // Update UI
      updateCalendar();
      dayModal.style.display = 'none';
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(`Failed to delete event: ${error.message}`);
    }
  }
}

// Make the functions available globally
window.server = {
  ajax,
  handleLogin,
  handleSignup,
  handleLogout,
  verifyAuth
};