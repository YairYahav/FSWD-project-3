// General Calendar
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const calendarMonthElement = document.getElementById('calendar-month');
const calendarElement = document.getElementById('calendar');
const addEventButton = document.getElementById('add-event');
const eventListElement = document.getElementById('event-list');

// Day Modal
const dayModal = document.getElementById('day-modal');
const closeDayModalButton = document.getElementById('close-day-modal');
const modalDateElement = document.getElementById('modal-date');
const modalEventsElement = document.getElementById('modal-events');
const addNewEventButton = document.getElementById('add-new-event');

// Event Modal
const addEventModal = document.getElementById('add-event-modal');
const closeAddEventModalButton = document.getElementById('close-add-event-modal');
const addEventForm = document.getElementById('add-event-form');
const eventNameInput = document.getElementById('event-name');
const eventStartTimeInput = document.getElementById('event-start-time');
const eventEndTimeInput = document.getElementById('event-end-time');
const eventDescriptionInput = document.getElementById('event-description');

// Current state variables
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let currentUsername = ''; // Will be set after login
let events = {};

// Initialize the calendar
function initializeCalendar() {
    prevMonthButton.addEventListener('click', () => changeMonth(-1));
    nextMonthButton.addEventListener('click', () => changeMonth(1));
    
    // Check if user is logged in and load their events
    checkLoginStatus();
}

// Check login status 
function checkLoginStatus() {
    // Get username from localStorage if it exists
    currentUsername = localStorage.getItem('currentUser');
    
    if (currentUsername) {
        // User is logged in, load their events
        fetchUserEvents();
    } else {
        // User is not logged in, show login form
        showLoginForm();
    }
    
    updateCalendar();
}

// Show login form
function showLoginForm() {
    // Implementation depends on your HTML structure
    console.log('User not logged in');
    // You would typically show a login form here
}

// Fetch events for the current user
function fetchUserEvents() {
    if (!currentUsername) return;
    
    fetch(`/events/${currentUsername}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            return response.json();
        })
        .then(userEvents => {
            // Transform the array of events into the format needed by your calendar
            events = {};
            userEvents.forEach(event => {
                if (!events[event.date]) {
                    events[event.date] = [];
                }
                events[event.date].push(event);
            });
            
            updateCalendar();
        })
        .catch(error => {
            console.error('Error fetching events:', error);
        });
}

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
        
        if (events[currentDay]) {
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
        dayEvents.forEach(event => {
            const eventBox = document.createElement('div');
            eventBox.classList.add('event-box');

            const eventElement = document.createElement('div');
            eventElement.textContent = event.name;

            const eventTimeElement = document.createElement('div');
            eventTimeElement.textContent = `${event.startTime} - ${event.endTime || 'N/A'}`;
            eventTimeElement.classList.add('event-time');
            
            eventElement.classList.add('event');
            eventElement.appendChild(eventTimeElement);

            eventElement.addEventListener('click', () => showEventDetails(event, day));
            modalEventsElement.appendChild(eventElement);
        });
    }
  
    dayModal.style.display = 'flex';
}
  
function updateDayModal(day) {
    const dayEvents = events[day] || [];
  
    modalDateElement.textContent = day;
    modalEventsElement.innerHTML = '';
  
    if (dayEvents.length === 0) {
        modalEventsElement.innerHTML = 'No events for this day.';
    } else {
        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.textContent = event.name;
            eventElement.classList.add('event');
            
            eventElement.addEventListener('click', () => {
                openEditEventModal(event, day);
            });
      
            modalEventsElement.appendChild(eventElement);
        });
    }
}

// Show event details in the modal
function showEventDetails(event, day) {
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
        openEditEventModal(event, day);
    });
    
    document.getElementById('delete-event-btn').addEventListener('click', () => {
        deleteEvent(event, day);
    });
}

// Open the add event modal
addNewEventButton.addEventListener('click', () => {
    addEventModal.style.display = 'flex';
});

// Close modals
closeDayModalButton.addEventListener('click', () => {
    dayModal.style.display = 'none';
});

closeAddEventModalButton.addEventListener('click', () => {
    addEventModal.style.display = 'none';
});

// Handle add event form submission
addEventForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!currentUsername) {
        alert('Please log in to add events');
        return;
    }

    const eventName = eventNameInput.value;
    const startTime = eventStartTimeInput.value;
    const endTime = eventEndTimeInput.value;
    const description = eventDescriptionInput.value;
    const selectedDate = modalDateElement.textContent;

    const newEvent = {
        name: eventName,
        startTime: startTime,
        endTime: endTime || null,
        description: description || null,
        date: selectedDate
    };

    // Send the new event to the server
    fetch('/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: currentUsername,
            event: newEvent
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add event');
        }
        return response.json();
    })
    .then(data => {
        // Update local events cache
        if (!events[selectedDate]) {
            events[selectedDate] = [];
        }
        events[selectedDate].push(newEvent);
        
        // Update UI
        updateCalendar();
        updateDayModal(selectedDate);
        
        // Close the modal
        addEventModal.style.display = 'none';
        
        // Reset form
        addEventForm.reset();
    })
    .catch(error => {
        console.error('Error adding event:', error);
        alert('Failed to add event. Please try again.');
    });
});

// Open the edit event modal
function openEditEventModal(event, day) {
    document.getElementById('edit-event-name').value = event.name;
    document.getElementById('edit-event-start-time').value = event.startTime;
    document.getElementById('edit-event-end-time').value = event.endTime || '';
    document.getElementById('edit-event-description').value = event.description || '';
  
    document.getElementById('edit-event-modal').style.display = 'flex';
  
    // Store the current event and day for the edit form handler
    window.currentEventForEdit = {
        event: event,
        day: day
    };
}

// Handle edit event form submission
document.getElementById('edit-event-form').addEventListener('submit', (e) => {
    e.preventDefault();

    if (!currentUsername || !window.currentEventForEdit) {
        return;
    }

    const { event: oldEvent, day } = window.currentEventForEdit;
    
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

    // Find the event index in the local array
    const eventIndex = events[day].findIndex(e => 
        e.name === oldEvent.name && 
        e.startTime === oldEvent.startTime
    );
    
    if (eventIndex !== -1) {
        // Send update request to server
        fetch(`/events/${currentUsername}/${day}/${eventIndex}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ event: updatedEvent })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update event');
            }
            return response.json();
        })
        .then(data => {
            // Update local events cache
            events[day][eventIndex] = updatedEvent;
            
            // Update UI
            updateCalendar();
            updateDayModal(day);
            
            // Close the modal
            document.getElementById('edit-event-modal').style.display = 'none';
        })
        .catch(error => {
            console.error('Error updating event:', error);
            alert('Failed to update event. Please try again.');
        });
    }
});

// Delete an event
function deleteEvent(event, day) {
    if (!currentUsername) return;
    
    // Find the event index
    const eventIndex = events[day].findIndex(e => 
        e.name === event.name && 
        e.startTime === event.startTime
    );
    
    if (eventIndex !== -1) {
        // Send delete request to server
        fetch(`/events/${currentUsername}/${day}/${eventIndex}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete event');
            }
            return response.json();
        })
        .then(data => {
            // Update local events cache
            events[day].splice(eventIndex, 1);
            if (events[day].length === 0) {
                delete events[day];
            }
            
            // Update UI
            updateCalendar();
            dayModal.style.display = 'none';
        })
        .catch(error => {
            console.error('Error deleting event:', error);
            alert('Failed to delete event. Please try again.');
        });
    }
}

// Close edit event modal
document.getElementById('close-edit-event-modal').addEventListener('click', () => {
    document.getElementById('edit-event-modal').style.display = 'none';
});

// Login function
function login(username, password) {
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
    })
    .then(data => {
        // Save username to localStorage
        localStorage.setItem('currentUser', username);
        currentUsername = username;
        
        // Fetch user events
        fetchUserEvents();
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials and try again.');
    });
}

// Register function
function register(username, password) {
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Registration failed');
        }
        return response.json();
    })
    .then(data => {
        alert('Registration successful! Please log in.');
    })
    .catch(error => {
        console.error('Registration error:', error);
        alert('Registration failed. Please try a different username.');
    });
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    currentUsername = '';
    events = {};
    updateCalendar();
    showLoginForm();
}

// Initialize calendar when the page loads
initializeCalendar();