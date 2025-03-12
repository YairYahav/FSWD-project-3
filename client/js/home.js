// DOM Elements
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

// Edit Event Modal
const editEventModal = document.getElementById('edit-event-modal');
const closeEditEventModalButton = document.getElementById('close-edit-event-modal');
const editEventForm = document.getElementById('edit-event-form');

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
    
    // Close modals
    closeDayModalButton.addEventListener('click', () => {
        dayModal.style.display = 'none';
    });

    closeAddEventModalButton.addEventListener('click', () => {
        addEventModal.style.display = 'none';
    });

    closeEditEventModalButton.addEventListener('click', () => {
        editEventModal.style.display = 'none';
    });
    
    // Open add event modal
    addEventButton.addEventListener('click', () => {
        addEventModal.style.display = 'flex';
    });
    
    addNewEventButton.addEventListener('click', () => {
        addEventModal.style.display = 'flex';
    });
    
    // Handle form submissions
    addEventForm.addEventListener('submit', handleAddEvent);
    editEventForm.addEventListener('submit', handleEditEvent);
    
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
        // User is not logged in, redirect to login
        window.location.href = '../html/login.html';
        return;
    }
    
    updateCalendar();
}

// Fetch events for the current user
function fetchUserEvents() {
    if (!currentUsername) return;
    
    window.ajax('GET', `/events/${currentUsername}`, null,
        // Success callback
        (response) => {
            events = response.data || {};
            updateCalendar();
            updateEventList(); // Update the sidebar event list
        },
        // Error callback
        (error) => {
            console.error('Error fetching events:', error);
        }
    );
}

// Update the sidebar event list
function updateEventList() {
    if (!eventListElement) return;
    
    eventListElement.innerHTML = '<h3>Upcoming Events</h3>';
    
    // Get all events and sort by date
    const allEvents = [];
    
    for (const date in events) {
        if (events[date] && Array.isArray(events[date])) {
            events[date].forEach(event => {
                allEvents.push({
                    ...event,
                    date: date
                });
            });
        }
    }
    
    // Sort by date and time
    allEvents.sort((a, b) => {
        if (a.date !== b.date) {
            return new Date(a.date) - new Date(b.date);
        }
        return a.startTime.localeCompare(b.startTime);
    });
    
    // Filter to show only upcoming events (today and future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today;
    }).slice(0, 5); // Show only next 5 events
    
    if (upcomingEvents.length === 0) {
        const noEventsElement = document.createElement('p');
        noEventsElement.textContent = 'No upcoming events';
        eventListElement.appendChild(noEventsElement);
    } else {
        upcomingEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.classList.add('sidebar-event');
            
            const dateObj = new Date(event.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            eventElement.innerHTML = `
                <div class="event-date">${formattedDate}</div>
                <div class="event-name">${event.name}</div>
                <div class="event-time">${event.startTime}${event.endTime ? ' - ' + event.endTime : ''}</div>
            `;
            
            eventElement.addEventListener('click', () => {
                showDayModal(event.date);
            });
            
            eventListElement.appendChild(eventElement);
        });
    }
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
        modalEventsElement.innerHTML = '<p>No events scheduled for this day.</p>';
    } else {
        // Create a clean list view of events
        const eventsList = document.createElement('div');
        eventsList.classList.add('events-list');
        
        dayEvents.forEach((event, index) => {
            const eventItem = document.createElement('div');
            eventItem.classList.add('event-item');
            
            eventItem.innerHTML = `
                <div class="event-header">
                    <h4 class="event-title">${event.name}</h4>
                    <div class="event-time">${event.startTime}${event.endTime ? ' - ' + event.endTime : ''}</div>
                </div>
                ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                <div class="event-actions">
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </div>
            `;
            
            eventsList.appendChild(eventItem);
        });
        
        modalEventsElement.appendChild(eventsList);
        
        // Add event listeners to all edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-index'));
                openEditEventModal(dayEvents[index], day, index);
            });
        });
        
        // Add event listeners to all delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-index'));
                if (confirm(`Are you sure you want to delete "${dayEvents[index].name}"?`)) {
                    deleteEvent(day, index);
                }
            });
        });
    }
  
    dayModal.style.display = 'flex';
}

// Open the edit event modal
function openEditEventModal(event, day, index) {
    document.getElementById('edit-event-name').value = event.name;
    document.getElementById('edit-event-start-time').value = event.startTime;
    document.getElementById('edit-event-end-time').value = event.endTime || '';
    document.getElementById('edit-event-description').value = event.description || '';
  
    editEventModal.style.display = 'flex';
    dayModal.style.display = 'none'; // Hide the day modal
  
    // Store the current event and day for the edit form handler
    window.currentEventForEdit = {
        event: event,
        day: day,
        index: index
    };
}

// Handle add event form submission
function handleAddEvent(e) {
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

    if (!eventName.trim()) {
        alert('Event name is required');
        return;
    }

    if (!startTime) {
        alert('Start time is required');
        return;
    }

    const newEvent = {
        name: eventName,
        startTime: startTime,
        endTime: endTime || null,
        description: description || null,
        date: selectedDate
    };

    window.ajax('POST', '/events', {
        username: currentUsername,
        event: newEvent
    },
    // Success callback
    (response) => {
        // Update local events cache
        events = response.data;
        
        // Update UI
        updateCalendar();
        updateEventList();
        showDayModal(selectedDate);
        
        // Close the modal
        addEventModal.style.display = 'none';
        
        // Reset form
        addEventForm.reset();
    },
    // Error callback
    (error) => {
        console.error('Error adding event:', error);
        alert('Failed to add event. Please try again.');
    });
}

// Handle edit event form submission
function handleEditEvent(e) {
    e.preventDefault();

    if (!currentUsername || !window.currentEventForEdit) {
        return;
    }

    const { day, index } = window.currentEventForEdit;
    
    const eventName = document.getElementById('edit-event-name').value;
    const startTime = document.getElementById('edit-event-start-time').value;
    const endTime = document.getElementById('edit-event-end-time').value;
    const description = document.getElementById('edit-event-description').value;

    if (!eventName.trim()) {
        alert('Event name is required');
        return;
    }

    if (!startTime) {
        alert('Start time is required');
        return;
    }

    const updatedEvent = {
        name: eventName,
        startTime: startTime,
        endTime: endTime || null,
        description: description || null,
        date: day
    };

    window.ajax('PUT', `/events/${currentUsername}/${day}/${index}`, {
        event: updatedEvent
    },
    // Success callback
    (response) => {
        // Update local events cache
        events = response.data;
        
        // Update UI
        updateCalendar();
        updateEventList();
        
        // Close the edit modal and show the day modal with updated events
        editEventModal.style.display = 'none';
        showDayModal(day);
    },
    // Error callback
    (error) => {
        console.error('Error updating event:', error);
        alert('Failed to update event. Please try again.');
    });
}

// Delete an event
function deleteEvent(day, index) {
    if (!currentUsername) return;
    
    window.ajax('DELETE', `/events/${currentUsername}/${day}/${index}`, null,
    // Success callback
    (response) => {
        // Update local events cache
        events = response.data;
        
        // Update UI
        updateCalendar();
        updateEventList();
        
        // Close the day modal if no events left, otherwise refresh it
        if (!events[day] || events[day].length === 0) {
            dayModal.style.display = 'none';
        } else {
            showDayModal(day);
        }
    },
    // Error callback
    (error) => {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
    });
}

// Add logout button functionality
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', logout);
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('authToken');
    window.location.href = '../html/login.html';
}

// Initialize calendar when the page loads
document.addEventListener('DOMContentLoaded', initializeCalendar);