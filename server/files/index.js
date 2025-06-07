// A variable at the top to store the last search results HTML
let lastSearchResultsHTML = '';


async function getEvents(keyword) {
    try {
        const apiUrl = `/event/?keyword=${encodeURIComponent(keyword)}`;
        const res = await fetch(apiUrl);

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const events = await res.json();
        return events;
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return [{ name: "Error fetching events. Please try again." }];
    }
}

async function displayEvents(keyword) {
    const eventsContainer = document.getElementById('eventsContainer');
    const containerTitle = document.querySelector('#event-details-container h1');

    if (!eventsContainer || !containerTitle) {
        console.error('Error: eventsContainer or its title not found in HTML.');
        return;
    }
    containerTitle.style.display = 'block'; // Make sure the title is visible
    eventsContainer.innerHTML = '<p>Loading events...</p>';

    const events = await getEvents(keyword);
    eventsContainer.innerHTML = ''; // Clear loading message

    if (events && events.length > 0) {
        if (events[0].name === "No Event found") {
            eventsContainer.innerHTML = '<p>No events found for your search.</p>';
        } else if (events[0].name === "Error fetching events. Please try again.") {
            eventsContainer.innerHTML = '<p>Sorry, an error occurred while fetching events. Please check the console for details and try again.</p>';
        } else {
            const ul = document.createElement('ul');
            ul.className = 'event-list';

            events.forEach(event => {
                const li = document.createElement('li');
                li.className = 'event-list-item';

                const infoDiv = document.createElement('div');
                infoDiv.innerHTML = `
                    <strong>Name:</strong> ${event.name || 'N/A'}<br>
                    <strong>Date:</strong> ${event.localDate ? new Date(event.localDate).toLocaleDateString() : 'N/A'}<br>
                    <strong>Venue:</strong> ${event.venue || 'N/A'}
                `;
                li.appendChild(infoDiv);

                const viewDetailsButton = document.createElement('button');
                viewDetailsButton.textContent = 'Select this Event';
                viewDetailsButton.className = 'details-button';
                viewDetailsButton.style.marginTop = '5px';

                // MODIFICATION: Instead of adding a listener, we add a data attribute
                // to store the ID directly on the button.
                viewDetailsButton.dataset.eventId = event.ID;

                li.appendChild(viewDetailsButton);
                ul.appendChild(li);
            });
            eventsContainer.appendChild(ul);

            // Store the freshly generated HTML of the results
            lastSearchResultsHTML = eventsContainer.innerHTML;
        }
    } else {
        eventsContainer.innerHTML = '<p>No events to display or an error occurred.</p>';
    }
}

function searchEvents() {
    const keywordInput = document.getElementById('keywordInput');
    if (!keywordInput) {
        console.error("Keyword input field not found!");
        return;
    }
    const keyword = keywordInput.value;
    if (keyword.trim() === "") {
        const eventsContainer = document.getElementById('eventsContainer');
        if(eventsContainer) eventsContainer.innerHTML = '<p>Please enter a keyword.</p>';
        return;
    }
    displayEvents(keyword);
}

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const keywordInput = document.getElementById('keywordInput');
    const eventsContainer = document.getElementById('eventsContainer');

    if (searchButton) {
        searchButton.addEventListener('click', searchEvents);
    } else {
        console.error("Search button not found!");
    }

    if (keywordInput) {
        keywordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchEvents();
            }
        });
    }

    // --- NEW: Event Delegation Listener ---
    // This single listener on the parent container handles clicks for all buttons inside it.
    if (eventsContainer) {
        eventsContainer.addEventListener('click', (e) => {
            const target = e.target;

            // Check if a "Select this Event" button was clicked
            if (target.classList.contains('details-button')) {
                const eventId = target.dataset.eventId;
                if (eventId) {
                    fetchAndDisplayEventDetails(eventId);
                }
            }

            // Check if the "Back" button was clicked
            if (target.classList.contains('back-button')) {
                const containerTitle = document.querySelector('#event-details-container h1');
                eventsContainer.innerHTML = lastSearchResultsHTML;
                if (containerTitle) {
                    containerTitle.style.display = 'block';
                }
            }
        });
    }
});


/**
 * Fetches and displays the details for a specific event, including a back button.
 * @param {string} eventID - The ID of the event to fetch.
 */
async function fetchAndDisplayEventDetails(eventID) {
    const eventsContainer = document.getElementById('eventsContainer');
    const containerTitle = document.querySelector('#event-details-container h1');

    if (!eventsContainer || !containerTitle) {
        console.error("Required container elements not found.");
        return;
    }

    eventsContainer.innerHTML = '<p>Loading event details...</p>';
    containerTitle.style.display = 'none';

    try {
        const apiUrl = `/eventdetails/${eventID}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.name || errorMessage;
            } catch (e) { /* Ignore parsing error */ }
            throw new Error(errorMessage);
        }

        const eventDetail = await response.json();
        eventsContainer.innerHTML = ''; // Clear loading message

        // Create and configure the back button
        const backButton = document.createElement('button');
        backButton.textContent = '← Back to Results';
        // Give it the 'back-button' class so our new listener can find it
        backButton.className = 'back-button';
        backButton.style.marginBottom = '15px';

        // MODIFICATION: No event listener is needed here anymore.

        eventsContainer.appendChild(backButton);

        // Display Event Details
        if (eventDetail && eventDetail.name !== "No Event found") {
            const detailElement = document.createElement('div');
            detailElement.className = 'event-detail-item';
            detailElement.innerHTML = `
                <h3>${eventDetail.name || "N/A"}</h3>
                <p><strong>Date:</strong> ${eventDetail.localDate || "N/A"} at ${eventDetail.localTime || ''}</p>
                <p><strong>Venue:</strong> ${eventDetail.venue || "N/A"}</p>
                <p><strong>Address:</strong> ${eventDetail.address || "N/A"}</p>
            `;
            eventsContainer.appendChild(detailElement);

            // Auto-fill Travel Form
            const destinationInput = document.getElementById('destinationLocation');
            const departureDateInput = document.getElementById('departureDate');
            if (destinationInput) destinationInput.value = eventDetail.venue || '';
            if (departureDateInput) departureDateInput.value = eventDetail.localDate || '';

        } else {
            eventsContainer.innerHTML += '<p>Event details could not be loaded or event not found.</p>';
        }

    } catch (error) {
        console.error("Failed to fetch event details:", error);
        containerTitle.style.display = 'block';
        eventsContainer.innerHTML = `<p class="error">Could not load event details: ${error.message}</p>`;
    }
}

// --- FLIGHT SEARCH FUNCTIONS ---

/**
 * Fetches flight offers from the backend based on form data.
 * @param {object} searchParams - An object with departure/destination details.
 * @returns {Promise<Array>} A promise that resolves to an array of formatted flight objects.
 */
async function getFlights(searchParams) {
    const transportsContainer = document.getElementById('transportsContainer');
    transportsContainer.innerHTML = '<p>Searching for flights...</p>'; // Loading message

    // Construct a query string from the search parameters
    const query = new URLSearchParams(searchParams).toString();
    const apiUrl = `http://localhost:3000/flights?${query}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        // The backend should return already formatted flight data
        const flights = await response.json();
        return flights;

    } catch (error) {
        console.error("Failed to fetch flights:", error);
        transportsContainer.innerHTML = `<p class="error">Error fetching flights: ${error.message}</p>`;
        return []; // Return an empty array on error
    }
}

/**
 * Displays the formatted flight results in the UI.
 * @param {Array<object>} flights - An array of formatted flight objects.
 */
function displayFlights(flights) {
    const transportsContainer = document.getElementById('transportsContainer');
    transportsContainer.innerHTML = ''; // Clear loading/error message

    if (!flights || flights.length === 0) {
        transportsContainer.innerHTML = '<p>No flights found for the selected criteria.</p>';
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'flight-list';

    flights.forEach(flight => {
        const li = document.createElement('li');
        li.className = 'flight-list-item'; // For styling
        li.innerHTML = `
            <strong>${flight.name}</strong><br>
            <span>From: ${flight.departureAirport} at ${flight.departureTime}</span><br>
            <span>To: ${flight.arrivalAirport} at ${flight.arrivalTime}</span><br>
            <span>Price: ${flight.price} ${flight.currency}</span>
            <hr>
        `;
        ul.appendChild(li);
    });

    transportsContainer.appendChild(ul);
}


/**
 * Reads data from the travel form and initiates the flight search.
 */
async function searchForFlights() {
    const departureLocation = document.getElementById('departureLocation').value;
    const destinationLocation = document.getElementById('destinationLocation').value;
    const departureDate = document.getElementById('departureDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const numberTravellers = document.getElementById('numberTravellers').value;

    // Basic validation
    if (!departureLocation || !destinationLocation || !departureDate || !returnDate) {
        alert('Please fill in all required travel fields.');
        return;
    }

    const searchParams = {
        from: departureLocation,
        to: destinationLocation,
        departDate: departureDate,
        returnDate: returnDate,
        adults: numberTravellers,
        children: 0 // Example: limit to 5 results, you can change this
    };

    const flights = await getFlights(searchParams);
    displayFlights(flights);
}


// --- ATTACH EVENT LISTENERS (in your DOMContentLoaded listener) ---
document.addEventListener('DOMContentLoaded', () => {
    // ... (Your existing listeners for searchButton, keywordInput, etc. go here) ...

    const flightSearchButton = document.getElementById('searchFlightsButton');
    if (flightSearchButton) {
        flightSearchButton.addEventListener('click', searchForFlights);
    } else {
        console.error("Flight search button not found!");
    }
});
