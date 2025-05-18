

async function getEvents(keyword) {
    try {
        const apiUrl = `/eventtest/?keyword=${encodeURIComponent(keyword)}`;
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
    if (!eventsContainer) {
        console.error('Error: eventsContainer element not found in HTML.');
        return;
    }
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
            ul.className = 'event-list'; // Optional: for styling

            events.forEach(event => {
                const li = document.createElement('li');
                li.className = 'event-list-item'; // Optional: for styling

                // Event Information
                const infoDiv = document.createElement('div');
                infoDiv.innerHTML = `
                    <strong>ID:</strong> ${event.ID || 'N/A'}<br>
                    <strong>Name:</strong> ${event.name || 'N/A'}<br>
                    <strong>Date:</strong> ${event.localDate ? new Date(event.localDate).toLocaleString() : 'N/A'}<br>
                    <strong>Artist/Info:</strong> ${event.artist || 'N/A'}<br>
                    <strong>Address/Note:</strong> ${event.address || 'N/A'}
                `;
                li.appendChild(infoDiv);

                // "View Details" Button for this specific event
                const viewDetailsButton = document.createElement('button');
                viewDetailsButton.textContent = 'Select this Event';
                viewDetailsButton.className = 'details-button'; // Optional: for styling
                viewDetailsButton.style.marginTop = '5px'; // Basic styling

                // Attach event listener directly to this button
                // This correctly captures the 'event.ID' for THIS event item
                viewDetailsButton.addEventListener('click', () => {
                    fetchAndDisplayEventDetails(event.ID);
                });

                li.appendChild(viewDetailsButton); // Add button to the list item
                ul.appendChild(li); // Add list item to the list
            });
            eventsContainer.appendChild(ul);
        }
    } else {
        eventsContainer.innerHTML = '<p>No events to display or an error occurred.</p>';
    }
}

// This function is called when the button is clicked (or by an event listener)
function searchEvents() {
    const keywordInput = document.getElementById('keywordInput');
    if (!keywordInput) {
        console.error("Keyword input field not found!");
        return;
    }
    const keyword = keywordInput.value;
    if (keyword.trim() === "") {
        alert("Please enter a keyword.");
        return;
    }
    displayEvents(keyword);
}

// --- Option 1: Keep using onclick in HTML ---
// The searchEvents function is now defined here and will be globally available
// if app.js is loaded in index.html.

// --- Option 2: Attach event listener programmatically (Recommended) ---
// This is often preferred for better separation of concerns.
// Ensure the DOM is loaded before trying to get elements.
document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const keywordInput = document.getElementById('keywordInput');

    if (searchButton) {
        searchButton.addEventListener('click', searchEvents);
    } else {
        console.error("Search button not found!");
    }

    // Optional: Allow pressing Enter in the input field to trigger search
    if (keywordInput) {
        keywordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchEvents();
            }
        });



    }




});






















/**
 * Fetches and displays the details for a specific event from the backend API.
 * @param {string} eventID - The ID of the event to fetch.
 */
async function fetchAndDisplayEventDetails(eventID) {
    const eventDetailsContainer = document.getElementById('event-details-container');
    if (!eventDetailsContainer) {
        console.error("HTML element with ID 'event-details-container' not found.");
        return;
    }

    eventDetailsContainer.innerHTML = '<p>Loading event details...</p>'; // Provide loading feedback

    try {
        // Construct the API URL using the provided eventID
        const apiUrl = `/eventtestdetails/${eventID}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            // Try to parse an error message from the server if available
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                // Assuming the backend might send a specific error structure
                errorMessage = errorData.message || errorData.name || errorMessage;
            } catch (e) {
                // Could not parse JSON error, use default HTTP error
            }
            throw new Error(errorMessage);
        }

        // The response from res.send() will be the body, parse it as JSON
        // This 'eventDetail' object is already formatted by your backend's 'formatEventDetails'
        const eventDetail = await response.json();

        // "Read" the data and display it
        console.log("Received Event Detail:", eventDetail);

        // Clear loading message
        eventDetailsContainer.innerHTML = '';

        if (eventDetail && (eventDetail.name !== "No Event found" && eventDetail.name !== "Event Not Found" && !eventDetail.name.startsWith("Error:"))) {
            // Format date for better readability if it's a valid date string
            let displayDate = eventDetail.localDate || "N/A";
            if (eventDetail.localDate && eventDetail.localDate !== "N/A") {
                try {
                    displayDate = new Date(eventDetail.localDate).toLocaleString();
                } catch (e) { /* Keep original if parsing fails */ }
            }

            const detailElement = document.createElement('div');
            detailElement.className = 'event-detail-item';
            detailElement.innerHTML = `
                <h3>${eventDetail.name || "N/A"}</h3>
                <p><strong>ID:</strong> ${eventDetail.ID || "N/A"}</p>
                <p><strong>Date:</strong> ${displayDate}</p>
                <p><strong>Artist/Info:</strong> ${eventDetail.artist || "N/A"}</p>
                <p><strong>Address/Note:</strong> ${eventDetail.address || "N/A"}</p>
            `;
            eventDetailsContainer.appendChild(detailElement);
        } else if (eventDetail && eventDetail.name) { // Handle "No Event found" or similar messages from API
            eventDetailsContainer.innerHTML = `<h3>${eventDetail.name}</h3>`;
            if(eventDetail.ID === "" && eventDetail.localDate === "" && eventDetail.artist === "" && eventDetail.address === "") {
                // This matches the "No Event found" structure
            } else {
                // Potentially a formatted error message with some detail fields still present
                // You might want to display more details if available
                let moreInfo = [];
                if (eventDetail.ID) moreInfo.push(`ID: ${eventDetail.ID}`);
                if (eventDetail.localDate) moreInfo.push(`Date: ${eventDetail.localDate}`);
                if (eventDetail.artist) moreInfo.push(`Artist: ${eventDetail.artist}`);
                if (eventDetail.address) moreInfo.push(`Address: ${eventDetail.address}`);
                if (moreInfo.length > 0) {
                    eventDetailsContainer.innerHTML += `<p>Details: ${moreInfo.join(', ')}</p>`;
                }
            }
        }
        else {
            eventDetailsContainer.innerHTML = '<p>Event details could not be loaded or event not found.</p>';
        }

    } catch (error) {
        console.error("Failed to fetch event details:", error);
        eventDetailsContainer.innerHTML = `<p class="error">Could not load event details: ${error.message}</p>`;
    }
}