// A variable at the top to store the last search results HTML
let lastSearchResultsHTML = '';

// --- MAP GLOBALS and UTILITY ---

let map = null;
let marker = null;
let hotelMarkers = [];


// --- ADD EVENT TO PRIVATE PAGE ---
window.eventAddPrivate =  function (id, title){
    
    let loginCheck = new XMLHttpRequest();
    loginCheck.open("GET", "/auth");
    loginCheck.send();

    loginCheck.onload = async function(){
        console.log("login loaded");
        let error = document.getElementById(`AddTo${id}Error`);

        try{
            error.textContent ="WHITE WHALE";
            if(loginCheck.status === 200){
                

                let o = {};
                o.event = title;
                console.log(o);
                let response = await fetch('/profile/events', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(o),
                });
 
                if (response.ok) {
                error.textContent = "✅ Successfully added";
                } else {
                error.textContent = "❌ Failed to add event.";
                }
            }
            else{
                error.textContent = "Not logged in...";
            }
        }
        catch(err){
            error.textContent = err.message;
        }
    }
}


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
    const containerTitle = document.querySelector('#event-details-container h2');
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

            li.innerHTML = `<div><strong>Name:</strong> ${event.name || 'N/A'}<br><strong>Date:</strong> ${event.localDate ? new Date(event.localDate).toLocaleDateString() : 'N/A'}<br><strong>Venue:</strong> ${event.venue || 'N/A'}</div><button class="details-button" data-event-id="${event.ID}" >Select this Event</button><button onclick='eventAddPrivate("${event.ID}", "${event.name}")'>Add to my Events</button><p id="AddTo${event.ID}Error"></p>`;
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
    const containerTitle = document.querySelector('#event-details-container h2');
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

            const eventDate = new Date(eventDetail.localDate);
            document.getElementById('departureDate').value = eventDetail.localDate || '';
            eventDate.setDate(eventDate.getDate() + 1);
            document.getElementById('returnDate').value = eventDate.toISOString().split('T')[0];

            document.getElementById('checkInDate').value = eventDetail.localDate || '';
            document.getElementById('checkOutDate').value = eventDate.toISOString().split('T')[0];

            // --- SHOW ON MAP ---
            // Check if event details include latitude and longitude for mapping
            if (eventDetail.lat && eventDetail.lng) {
                // If coordinates exist, show the concert marker on the map
                showConcertOnMap(eventDetail.lat, eventDetail.lng, eventDetail.venue || eventDetail.name);

                // remove any previous error message about missing location
                const mapError = document.getElementById('map-geocode-error');
                if (mapError) mapError.remove();

            } else {
                // If no coordinates are available for the event,
                console.warn("No latitude/longitude found for this event.");

                // Display a visible message to the user just below the map
                let mapDiv = document.getElementById('map');
                if (mapDiv) {
                    // Check if the error message already exists to avoid duplicating it
                    let errorDiv = document.getElementById('map-geocode-error');
                    if (!errorDiv) {
                        // Create a styled error message
                        errorDiv = document.createElement('div');
                        errorDiv.id = 'map-geocode-error';
                        errorDiv.style.color = 'red';
                        errorDiv.style.fontWeight = 'bold';
                        errorDiv.style.marginTop = '8px';
                    }
                    errorDiv.textContent = "Sorry, there is no map location available for this event!";
                    // Insert the error message just below the map div
                    mapDiv.parentNode.insertBefore(errorDiv, mapDiv.nextSibling);
                }
            }

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

// Fetches the offers for a list of hotel window.onload = async function () {


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

    
    // filter only hotels with offers
    let hotelsWithOffers = hotels.filter(h => offerMap.has(h.hotelId));

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

     // --- Add hotel markers on map for currently displayed hotels
    showHotelsOnMap(hotelsWithOffers);
    // hotelsWithOffers only, otherwise too many markers...
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

    document.getElementById('transport-details-container').classList.add('show');


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


// --- Show a concert marker on the map using the custom concert icon ---
function showConcertOnMap(lat, lng, title = "Selected Concert") {

    // Define the red concert icon with correct size and anchor points
    const concertIcon = L.icon({
        iconUrl: 'concert_icon_red.png',
        iconSize: [24, 32],    // [width, height] in pixels
        iconAnchor: [12, 32],  // The bottom-center tip of the icon will be at the marker's position
        popupAnchor: [0, -32]  // Popup appears directly above the icon's tip
    });

    // Return early if the map is not initialized
    if (!map) return;

    // Remove any existing concert marker to avoid multiple markers for different events
    if (marker) map.removeLayer(marker);

    // Add the new concert marker at the given coordinates with the custom icon and popup
    marker = L.marker([lat, lng], {icon: concertIcon})
        .addTo(map)
        .bindPopup(title)
        .openPopup();

    // Center and zoom the map on the concert location
    map.setView([lat, lng], 15);
}

// --- Place multiple hotel markers on the map, each with a custom blue icon. ---
function showHotelsOnMap(hotels) {
    // Remove previously shown hotel markers from the map
    hotelMarkers.forEach(m => map.removeLayer(m));
    hotelMarkers = [];
    let bounds = []; // Store marker coordinates for fitBounds

    // If there are no hotels to display, log and exit
    if (!hotels || !hotels.length) {
        console.log("No hotels to mark on map!");
        return;
    }

    console.log("Hotels to add markers for:", hotels);

    hotels.forEach(hotel => {
        // Output hotel coordinates for debugging
        console.log("Check hotel coords:", hotel.name, hotel.latitude, hotel.longitude);

        // Only display markers for hotels that have coordinates
        if (hotel.latitude && hotel.longitude) {
            // Create a marker for each hotel using the custom blue icon
            let hMarker = L.marker([hotel.latitude, hotel.longitude], {icon: L.icon({
                iconUrl: 'hotel_icon_blue.png',
                iconSize: [24, 32],
                iconAnchor: [12, 32],
                popupAnchor: [0, -32],
            })})
            .addTo(map)
            .bindPopup(`<strong>${hotel.name}</strong>${hotel.address ? '<br>' + hotel.address : ''}`);

            // Make the hotel popup open on mouseover and close on mouseout
            hMarker.on('mouseover', function(e) { this.openPopup(); });
            hMarker.on('mouseout', function(e) { this.closePopup(); });

            // Add marker to management array and its position to the bounds array
            hotelMarkers.push(hMarker);
            bounds.push([hotel.latitude, hotel.longitude]);
        }
    });

    // Add the concert marker's location to bounds, so both concert and hotels are visible
    if (marker && marker.getLatLng) {
        const eventLatLng = marker.getLatLng();
        bounds.push([eventLatLng.lat, eventLatLng.lng]);
    }

    // Adjust the map view so all markers (hotels and concert) are visible with padding
    if (bounds.length > 0) {
        map.fitBounds(bounds, {padding: [30, 30]});
    }
}




document.addEventListener('DOMContentLoaded', () => {
    // --- Initialize the map when the page is loaded ---
    map = L.map('map').setView([48.2082, 16.3738], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

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
                const containerTitle = document.querySelector('#event-details-container h2');
                eventsContainer.innerHTML = lastSearchResultsHTML;
                if (containerTitle) { containerTitle.style.display = 'block'; }
                // --- Remove marker when going back ---
                if (marker) {
                    map.removeLayer(marker);
                    marker = null;
                }
                 // Remove hotel markers too!
                hotelMarkers.forEach(m => map.removeLayer(m));
                hotelMarkers = [];
            }
        });
    }
});