/**
 * A helper function to format an ISO 8601 duration string (e.g., "PT3H45M")
 * into a more human-readable format (e.g., "3h 45m").
 * @param {string} isoDuration - The ISO 8601 duration string.
 * @returns {string} A formatted, human-readable duration.
 */
function formatDuration(isoDuration) {
    if (!isoDuration) return 'N/A';
    // Remove "PT" prefix and split into hours (H) and minutes (M)
    const matches = isoDuration.replace('PT', '').match(/(\d+H)?(\d+M)?/);
    if (!matches) return isoDuration; // Return original if format is unexpected

    const hours = matches[1] ? matches[1].replace('H', 'h') : '';
    const minutes = matches[2] ? matches[2].replace('M', 'm') : '';

    return `${hours} ${minutes}`.trim();
}

/**
 * A helper function to format a date-time string into a locale-specific time.
 * @param {string} dateTimeString - The date-time string (e.g., "2025-08-01T14:45:00").
 * @returns {string} A formatted time string (e.g., "2:45 PM").
 */
function formatTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


/**
 * Parses the raw JSON response from the Amadeus Flight Offers API
 * and transforms it into an array of simplified, easy-to-use flight objects.
 *
 * @param {string} inputFlights - The raw JSON string from the Amadeus API.
 * @returns {Array<object>} An array of formatted flight objects.
 */
function formatFlight(inputFlights) {
    let iFlights;
    try {
        iFlights = JSON.parse(inputFlights);
    } catch (error) {
        console.error("Invalid JSON for flights:", error);
        return [{ name: "Invalid flight data received." }];
    }

    // Check if flight data exists and is not empty
    if (!iFlights.data || iFlights.data.length === 0) {
        return [{ name: "No flights found for your search." }];
    }

    const flights = [];

    iFlights.data.forEach(data => {
        const flight = {};

        // Each 'data' object is a flight offer. The journey details are in itineraries.
        // We'll focus on the first itinerary (the outbound flight).
        const outboundItinerary = data.itineraries[0];
        const firstSegment = outboundItinerary.segments[0];
        const lastSegment = outboundItinerary.segments[outboundItinerary.segments.length - 1];

        flight.ID = data.id;
        flight.name = `Flight Option ${data.id} (${formatDuration(outboundItinerary.duration)})`;
        flight.departureTime = formatTime(firstSegment.departure.at);
        flight.arrivalTime = formatTime(lastSegment.arrival.at);
        flight.departureAirport = firstSegment.departure.iataCode;
        flight.arrivalAirport = lastSegment.arrival.iataCode;
        flight.price = data.price.grandTotal; // Use grandTotal for the final price
        flight.currency = data.price.currency;

        flights.push(flight);
    });

    return flights;
}

module.exports = formatFlight;
