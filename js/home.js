// General Calander
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

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();


// Temporary!!!! We need to save on the server
let events = {};

function initializeCalendar() {
    prevMonthButton.addEventListener('click', () => changeMonth(-1));
    nextMonthButton.addEventListener('click', () => changeMonth(1));

    updateCalendar();
}


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
  
  // Add days
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < weekdays.length; i++) {
    const weekdayElement = document.createElement('div');
    weekdayElement.textContent = weekdays[i];
    weekdayElement.classList.add('weekdays');
    calendarElement.appendChild(weekdayElement);
  }

  // Add Empty Days Before Start of Month to start In the correct day 
  // (took toooooo much time for no reason)
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    calendarElement.appendChild(emptyDay);
  }

  // Add Days of the Month for each block
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.textContent = day;

    // IDK why does it work only if like were in America
    const currentDay = `${currentYear}-${currentMonth + 1}-${day < 10 ? '0' + day : day}`;
    
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
        eventElement.textContent = event.name

        const eventTimeElement = document.createElement('div');
        eventTimeElement.textContent = `${event.startTime} - ${event.endTime || 'N/A'}`;
        eventTimeElement.classList.add('event-time');
        
        eventElement.classList.add('event');
        eventElement.appendChild(eventTimeElement);

        eventElement.addEventListener('click', () => showEventDetails(event));
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
          openEditEventModal(event);
        });
  
        modalEventsElement.appendChild(eventElement);
      });
    }
  }


  
function showEventDetails(event) {
  const eventDetails = document.createElement('div');
  eventDetails.innerHTML = `
    <h4>${event.name}</h4>
    <p>Start Time: ${event.startTime}</p>
    ${event.endTime ? `<p>End Time: ${event.endTime}</p>` : ''}
    ${event.description ? `<p>Description: ${event.description}</p>` : ''}
    <button onclick="editEvent('${event.name}')">Edit</button>
  `;
  modalEventsElement.innerHTML = '';
  modalEventsElement.appendChild(eventDetails);
}

addNewEventButton.addEventListener('click', () => {
  addEventModal.style.display = 'flex';
});

closeDayModalButton.addEventListener('click', () => {
  dayModal.style.display = 'none';
});

closeAddEventModalButton.addEventListener('click', () => {
  addEventModal.style.display = 'none';
});

addEventForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const eventName = eventNameInput.value;
  const startTime = eventStartTimeInput.value;
  const endTime = eventEndTimeInput.value;
  const description = eventDescriptionInput.value;

  const newEvent = {
    name: eventName,
    startTime: startTime,
    endTime: endTime || null,
    description: description || null
  };

  const selectedDate = modalDateElement.textContent;

  if (!events[selectedDate]) {
    events[selectedDate] = [];
  }

  events[selectedDate].push(newEvent);
  updateCalendar();
  updateDayModal(selectedDate);
  addEventModal.style.display = 'none';
});

  
  function openEditEventModal(event) {
    document.getElementById('edit-event-name').value = event.name;
    document.getElementById('edit-event-start-time').value = event.startTime;
    document.getElementById('edit-event-end-time').value = event.endTime || '';
    document.getElementById('edit-event-description').value = event.description || '';
  
    document.getElementById('edit-event-modal').style.display = 'flex';
  
    window.currentEventForEdit = event;
  }

  function getEventByName(eventName) {
    for (const day in events) {
      const event = events[day].find(e => e.name === eventName);
      if (event) return event;
    }
    return null;
  }

  

  document.getElementById('edit-event-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const eventName = document.getElementById('edit-event-name').value;
  const startTime = document.getElementById('edit-event-start-time').value;
  const endTime = document.getElementById('edit-event-end-time').value;
  const description = document.getElementById('edit-event-description').value;

  const updatedEvent = {
    name: eventName,
    startTime: startTime,
    endTime: endTime || null,
    description: description || null
  };

  const day = modalDateElement.textContent;
  const eventIndex = events[day].findIndex(event => event.name === eventName);
  
  if (eventIndex !== -1) {
    events[day][eventIndex] = updatedEvent;
    updateCalendar();
    updateDayModal(selectedDate);
    dayModal.style.display = 'flex'; // Keep the day modal open after saving
  }
  
  document.getElementById('edit-event-modal').style.display = 'none'; 
});

// Close Modals
document.getElementById('close-edit-event-modal').addEventListener('click', () => {
  document.getElementById('edit-event-modal').style.display = 'none';
});




function saveChanges(day, updatedEvent) {
    //לא עובד בכלל אז הורדתי
  }







initializeCalendar();