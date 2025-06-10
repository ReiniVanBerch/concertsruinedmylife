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
            li.innerHTML = `<div><strong>Name:</strong> ${event.name || 'N/A'}<br><strong>Date:</strong> ${event.localDate ? new Date(event.localDate).toLocaleDateString() : 'N/A'}<br><strong>Venue:</strong> ${event.venue || 'N/A'}</div><button class="details-button" data-event-id="${event.ID}" >Select this Event</button>`;
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

        eventsContainer.innerHTML = `<button class="back-button">← Back to Results</button>`;

        if (eventDetail && eventDetail.name !== "No Event found") {
            const detailElement = document.createElement('div');
            detailElement.className = 'event-detail-item';
            detailElement.innerHTML = `<h3>${eventDetail.name || "N/A"}</h3><p><strong>Date:</strong> ${eventDetail.localDate || "N/A"} at ${eventDetail.localTime || ''}</p><p><strong>Venue:</strong> ${eventDetail.venue || "N/A"}</p><p><strong>Address:</strong> ${eventDetail.address || "N/A"}</p>`;
            eventsContainer.appendChild(detailElement);

            document.getElementById('departureDate').value = eventDetail.localDate || '';
            document.getElementById('checkInDate').value = eventDetail.localDate || '';

            // Get the destination IATA code and place it in the destination input.
            const destinationIata = await getIataCode(eventDetail.address);
            if(destinationIata) {
                document.getElementById('destinationLocation').value = destinationIata;
            } else {
                document.getElementById('destinationLocation').value = eventDetail.venue || eventDetail.name;
                console.warn("Could not geocode venue address. Travel search might fail.");
            }

        } else {
            eventsContainer.innerHTML += '<p>Event details could not be loaded.</p>';
        }
    } catch (error) {
        console.error("Failed to fetch event details:", error);
        containerTitle.style.display = 'block';
        eventsContainer.innerHTML = `<p class="error">Could not load event details.</p>`;
    }
}


// --- GEOCODING, FLIGHT, & HOTEL SEARCH FUNCTIONS ---

async function getIataCode(locationName) {
    try {
        const geoUrl = `/geoloc?POI=${encodeURIComponent(locationName)}`;
        let geoRes = await fetch(geoUrl);
        if (!geoRes.ok) throw new Error('Failed to get geocode');
        let geoData = await geoRes.json();
        const coordinates = geoData.features[0].geometry.coordinates;
        const point = `${coordinates[0]},${coordinates[1]}`;
        const airportUrl = `/geolocairport?POI=${encodeURIComponent(point)}`;
        let airportRes = await fetch(airportUrl);
        if (!airportRes.ok) throw new Error('Failed to get airport');
        let airportData = await airportRes.json();
        return airportData.features[0].properties.airport.iata;
    } catch (error) {
        console.error(`Could not get IATA code for "${locationName}":`, error);
        return null;
    }
}

async function getFlights(searchParams) {
    const transportsContainer = document.getElementById('transportsContainer');
    transportsContainer.innerHTML = '<p>Searching for flights...</p>';
    const query = new URLSearchParams(searchParams).toString();
    const apiUrl = `/flights?${query}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) { throw new Error(`HTTP error! Status: ${response.status}`); }
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

// Fetches the initial list of hotels.
async function getHotels(cityCode) {
    const accommodationsContainer = document.getElementById('accomodationsContainer');
    accommodationsContainer.innerHTML = '<p>Searching for hotels...</p>';
    const apiUrl = `/accomodations?cityCode=${encodeURIComponent(cityCode)}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) { throw new Error('Failed to fetch hotel list.'); }
        const hotelResponse = await response.json();
        return (hotelResponse && Array.isArray(hotelResponse.data)) ? hotelResponse.data : [];
    } catch (error) {
        console.error("Failed to fetch hotels:", error);
        if (accommodationsContainer) {
            accommodationsContainer.innerHTML = `<p class="error">Error fetching hotel list.</p>`;
        }
        return [];
    }
}

// Fetches the offers for a list of hotel IDs.
async function getHotelOffers(searchParams) {
    const query = new URLSearchParams(searchParams).toString();
    const apiUrl = `/accomodationsoffers?${query}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) { throw new Error('Failed to fetch hotel offers.'); }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch hotel offers:", error);
        return [];
    }
}

// Displays hotels with their corresponding offers.
function displayHotelsWithOffers(hotels, offers) {
    const accommodationsContainer = document.getElementById('accomodationsContainer');
    accommodationsContainer.innerHTML = '';

    if (!hotels || hotels.length === 0) {
        accommodationsContainer.innerHTML = '<p>No hotels found for this city.</p>';
        return;
    }

    const offerMap = new Map();
    offers.forEach(offer => offerMap.set(offer.hotelId, offer));

    const ul = document.createElement('ul');
    ul.className = 'hotel-list';

    offers.forEach(offer => {
        const li = document.createElement('li');
        li.className = 'hotel-list-item';

        li.innerHTML = `
            <strong>${offer.name}</strong>
            <p>${offer.description}</p>
            <p><strong>Price: ${offer.price} ${offer.currency}</strong></p>
            <hr>
        `;
        ul.appendChild(li);
    });

    if (ul.children.length === 0) {
        accommodationsContainer.innerHTML = '<p>No hotel offers are available for your selected dates.</p>';
    } else {
        accommodationsContainer.appendChild(ul);
    }
}

// MODIFIED: This function now chunks the hotel ID requests to avoid URL length errors.
async function searchForTravel() {
    const departureLocationText = document.getElementById('departureLocation').value;
    const destinationIata = document.getElementById('destinationLocation').value;
    const departureDate = document.getElementById('departureDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;
    const numberTravellers = document.getElementById('numberTravellers').value;
    const roomQuantity = document.getElementById('accomGuests').value || 1;

    if (!departureLocationText || !destinationIata || !departureDate || !returnDate) {
        alert('Please select an event and fill in all required travel fields.');
        return;
    }

    // --- 1. Geocode departure and search for flights ---
    const fromIata = await getIataCode(departureLocationText);
    if (!fromIata) {
        alert('Could not find an airport for your departure location.');
        return;
    }
    const flightSearchParams = { from: fromIata, to: destinationIata, departDate: departureDate, returnDate: returnDate, adults: numberTravellers, children: 0 };
    getFlights(flightSearchParams).then(displayFlights);

    // --- 2. Get hotel list and then get offers for that list in chunks ---
    const hotels = await getHotels(destinationIata);
    if (hotels.length > 0) {
        const hotelIds = hotels.map(h => h.hotelId);

        // --- CHUNKING LOGIC ---
        const chunkSize = 10; // Number of hotel IDs per API request
        const offerPromises = [];

        for (let i = 0; i < hotelIds.length; i += chunkSize) {
            const chunk = hotelIds.slice(i, i + chunkSize);
            const hotelOfferParams = {
                hotelIds: chunk.join(','),
                checkin: checkInDate,
                checkout: checkOutDate || returnDate,
                adults: numberTravellers,
                rooms: roomQuantity
            };
            // Add the promise to the array, don't await here
            offerPromises.push(getHotelOffers(hotelOfferParams));
        }

        // Wait for all the chunked requests to complete
        const offerChunks = await Promise.all(offerPromises);
        // Flatten the array of arrays into a single array of offers
        const allOffers = offerChunks.flat();

        displayHotelsWithOffers(hotels, allOffers);

    } else {
        displayHotelsWithOffers([], []); // Show "no hotels" message
    }
}


// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const keywordInput = document.getElementById('keywordInput');
    if (searchButton) { searchButton.addEventListener('click', () => displayEvents(keywordInput.value)); }

    const travelSearchButton = document.getElementById('searchFlightsButton');
    if (travelSearchButton) { travelSearchButton.addEventListener('click', searchForTravel); }

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
