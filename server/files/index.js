// A variable at the top to store the last search results HTML
let lastSearchResultsHTML = '';


// --- EVENT SEARCH FUNCTIONS ---

async function getEvents(keyword) {
    try {
        const apiUrl = `/event/?keyword=${encodeURIComponent(keyword)}`;
        const res = await fetch(apiUrl);
        if (!res.ok) { throw new Error(`HTTP error! status: ${res.status}`); }
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return [{ name: "Error fetching events. Please try again." }];
    }
}

async function displayEvents(keyword) {
    const eventsContainer = document.getElementById('eventsContainer');
    const containerTitle = document.querySelector('#event-details-container h1');
    if (!eventsContainer || !containerTitle) { return; }
    containerTitle.style.display = 'block';
    eventsContainer.innerHTML = '<p>Loading events...</p>';
    const events = await getEvents(keyword);
    eventsContainer.innerHTML = '';
    if (events && events.length > 0 && events[0].name !== "No Event found") {
        const ul = document.createElement('ul');
        ul.className = 'event-list';
        events.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-list-item';
            li.innerHTML = `<div><strong>Name:</strong> ${event.name || 'N/A'}<br><strong>Date:</strong> ${event.localDate ? new Date(event.localDate).toLocaleDateString() : 'N/A'}<br><strong>Venue:</strong> ${event.venue || 'N/A'}</div><button class="details-button" data-event-id="${event.ID}" style="margin-top: 5px;">Select this Event</button>`;
            ul.appendChild(li);
        });
        eventsContainer.appendChild(ul);
        lastSearchResultsHTML = eventsContainer.innerHTML;
    } else {
        eventsContainer.innerHTML = '<p>No events found for your search.</p>';
    }
}

async function fetchAndDisplayEventDetails(eventID) {
    const eventsContainer = document.getElementById('eventsContainer');
    const containerTitle = document.querySelector('#event-details-container h1');
    if (!eventsContainer || !containerTitle) { return; }
    eventsContainer.innerHTML = '<p>Loading event details...</p>';
    containerTitle.style.display = 'none';
    try {
        const apiUrl = `/eventdetails/${eventID}`;
        const response = await fetch(apiUrl);
        if (!response.ok) { throw new Error(`HTTP error! Status: ${response.status}`); }
        const eventDetail = await response.json();
        eventsContainer.innerHTML = `<button class="back-button" style="margin-bottom: 15px;">← Back to Results</button>`;
        if (eventDetail && eventDetail.name !== "No Event found") {
            const detailElement = document.createElement('div');
            detailElement.className = 'event-detail-item';
            detailElement.innerHTML = `<h3>${eventDetail.name || "N/A"}</h3><p><strong>Date:</strong> ${eventDetail.localDate || "N/A"} at ${eventDetail.localTime || ''}</p><p><strong>Venue:</strong> ${eventDetail.venue || "N/A"}</p><p><strong>Address:</strong> ${eventDetail.address || "N/A"}</p>`;
            eventsContainer.appendChild(detailElement);
            document.getElementById('destinationLocation').value = eventDetail.venue || '';
            document.getElementById('departureDate').value = eventDetail.localDate || '';
        } else {
            eventsContainer.innerHTML += '<p>Event details could not be loaded.</p>';
        }
    } catch (error) {
        console.error("Failed to fetch event details:", error);
        containerTitle.style.display = 'block';
        eventsContainer.innerHTML = `<p class="error">Could not load event details.</p>`;
    }
}


// --- FLIGHT & HOTEL SEARCH FUNCTIONS ---

async function getFlights(searchParams) {
    const transportsContainer = document.getElementById('transportsContainer');
    transportsContainer.innerHTML = '<p>Searching for flights...</p>';
    const query = new URLSearchParams(searchParams).toString();
    const apiUrl = `/flights?${query}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch flights:", error);
        transportsContainer.innerHTML = `<p class="error">Error fetching flights.</p>`;
        return [];
    }
}

function displayFlights(flights) {
    const transportsContainer = document.getElementById('transportsContainer');
    transportsContainer.innerHTML = '';
    if (!flights || flights.length === 0 || (flights[0] && flights[0].name === "No flights found for your search.")) {
        transportsContainer.innerHTML = '<p>No flights found for the selected criteria.</p>';
        return;
    }
    const ul = document.createElement('ul');
    ul.className = 'flight-list';
    flights.forEach(flight => {
        const li = document.createElement('li');
        li.className = 'flight-list-item';
        li.innerHTML = `<strong>${flight.name}</strong><br><span>From: ${flight.departureAirport} at ${flight.departureTime}</span><br><span>To: ${flight.arrivalAirport} at ${flight.arrivalTime}</span><br><span>Price: ${flight.price} ${flight.currency}</span><hr>`;
        ul.appendChild(li);
    });
    transportsContainer.appendChild(ul);
}

async function getHotels(cityCode) {
    const accommodationsContainer = document.getElementById('accomodationsContainer');
    accommodationsContainer.innerHTML = '<p>Searching for hotels...</p>';
    const apiUrl = `/accomodations?cityCode=${encodeURIComponent(cityCode)}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.name || `HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch hotels:", error);
        accommodationsContainer.innerHTML = `<p class="error">Error fetching hotels: ${error.message}</p>`;
        return [];
    }
}

function displayHotels(hotels) {
    const accommodationsContainer = document.getElementById('accomodationsContainer');
    accommodationsContainer.innerHTML = '';
    if (!hotels || hotels.length === 0 || (hotels[0] && hotels[0].name.includes("No hotels"))) {
        accommodationsContainer.innerHTML = '<p>No hotels found for this city.</p>';
        return;
    }
    const ul = document.createElement('ul');
    ul.className = 'hotel-list';
    hotels.forEach(hotel => {
        const li = document.createElement('li');
        li.className = 'hotel-list-item';
        li.innerHTML = `<strong>${hotel.name}</strong><br><span>Distance: ${hotel.distance}</span><hr>`;
        ul.appendChild(li);
    });
    accommodationsContainer.appendChild(ul);
}

/**
 * MODIFIED: Reads data from the form and initiates BOTH flight and hotel searches
 * using the user's specified parameter names.
 */
async function searchForTravel() {
    const departureLocation = document.getElementById('departureLocation').value;
    const destinationLocation = document.getElementById('destinationLocation').value;
    const departureDate = document.getElementById('departureDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const numberTravellers = document.getElementById('numberTravellers').value;

    if (!departureLocation || !destinationLocation || !departureDate || !returnDate) {
        alert('Please fill in all required travel fields.');
        return;
    }

    // --- Flight Search Logic with USER-SPECIFIED parameters ---
    const flightSearchParams = {
        from: departureLocation,
        to: destinationLocation,
        departDate: departureDate, // Using your parameter name
        returnDate: returnDate,   // Using your parameter name
        adults: numberTravellers, // Using your parameter name
        children: 0               // Using your parameter name
    };
    getFlights(flightSearchParams).then(displayFlights);

    // --- Hotel Search Logic (Unaffected) ---
    const cityCodeForHotels = destinationLocation;
    getHotels(cityCodeForHotels).then(displayHotels);
}


// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    // Event Search Listener
    const searchButton = document.getElementById('searchButton');
    const keywordInput = document.getElementById('keywordInput');
    if (searchButton) { searchButton.addEventListener('click', () => displayEvents(keywordInput.value)); }
    if (keywordInput) { keywordInput.addEventListener('keypress', e => { if (e.key === 'Enter') displayEvents(keywordInput.value); }); }

    // Travel Search Listener
    const travelSearchButton = document.getElementById('searchFlightsButton');
    if (travelSearchButton) {
        travelSearchButton.addEventListener('click', searchForTravel);
    }

    // Event Delegation Listener for details/back buttons
    const eventsContainer = document.getElementById('eventsContainer');
    if (eventsContainer) {
        eventsContainer.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('details-button')) {
                fetchAndDisplayEventDetails(target.dataset.eventId);
            }
            if (target.classList.contains('back-button')) {
                const containerTitle = document.querySelector('#event-details-container h1');
                eventsContainer.innerHTML = lastSearchResultsHTML;
                if (containerTitle) { containerTitle.style.display = 'block'; }
            }
        });
    }
});
