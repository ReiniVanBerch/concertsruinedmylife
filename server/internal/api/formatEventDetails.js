/**
 * Parses a JSON string representing a single event and formats it into a structured object.
 * This function is designed to handle event JSON from the Ticketmaster API.
 * @param {string} inputEvents - A JSON string for a single event.
 * @returns {object} A formatted event object.
 */
function formatEvents(inputEvents) {
    // It's a good practice to wrap JSON parsing in a try...catch block
    // to handle cases where the input string is not valid JSON.
    let iEvents;
    try {
        iEvents = JSON.parse(inputEvents);
    } catch (error) {
        console.error("Invalid JSON string provided:", error);
        // Return the "not found" structure for invalid input
        return {
            ID: "", name: "Event not found", localDate: "", localTime: "",
            venue: "", artist: "", address: "Invalid data provided"
        };
    }

    const event = {};

    // Check if the parsed object is a valid event by looking for an 'id'
    if (iEvents && iEvents.id) {
        // Safely access the venue data. This prevents errors if _embedded or venues is missing.
        const venueData = (iEvents._embedded && iEvents._embedded.venues && iEvents._embedded.venues[0])
            ? iEvents._embedded.venues[0]
            : null;

        // --- Assign Core Event Properties ---
        event.ID = iEvents.id;
        event.name = iEvents.name;
        event.localDate = iEvents.dates.start.localDate; // Using localDate is often cleaner
        event.localTime = iEvents.dates.start.localTime;

        // For a single-artist event, the event's name is the artist's name.
        event.artist = iEvents.name;

        // --- Extract Venue and Address from Nested Data ---
        if (venueData) {
            event.venue = venueData.name;

            // Build a full, readable address from its component parts.
            // This filters out any parts that are null or undefined.
            const addressParts = [
                venueData.address ? venueData.address.line1 : null,
                venueData.city ? venueData.city.name : null,
                venueData.country ? venueData.country.name : null,
                venueData.postalCode
            ];
            event.address = addressParts.filter(part => part).join(', ');
        } else {
            // Provide fallback values if no venue information is present
            event.venue = 'Venue not specified';
            event.address = 'Address not specified';
        }

        return event;

    } else {
        // Handle cases where the JSON is valid but not a recognizable event
        return {
            ID: "", name: "Event not found", localDate: "", localTime: "",
            venue: "", artist: "", address: ""
        };
    }
}

module.exports = formatEvents;
