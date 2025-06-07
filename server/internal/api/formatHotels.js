/**
 * Cleans up a hotel name string by removing excess whitespace and newlines.
 * @param {string} name - The raw hotel name from the API.
 * @returns {string} The cleaned-up hotel name.
 */
function cleanHotelName(name) {
    if (!name) return 'Unnamed Hotel';
    // Replace newline characters with a space, then replace multiple spaces with a single space.
    return name.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, ' ').trim();
}

/**
 * Parses the raw JSON response from the Amadeus Hotels API
 * and transforms it into an array of simplified, easy-to-use hotel objects.
 *
 * @param {string} rawHotelData - The raw JSON string from the Amadeus API.
 * @returns {Array<object>} An array of formatted hotel objects.
 */
function formatHotels(rawHotelData) {
    let hotelJson;
    try {
        hotelJson = JSON.parse(rawHotelData);
    } catch (error) {
        console.error("Error parsing hotel data JSON:", error);
        return [{ name: "Invalid hotel data format." }];
    }

    // Check for API errors or if no data is present
    if (!hotelJson.data || hotelJson.data.length === 0) {
        if (hotelJson.errors) {
            console.error("Amadeus API Error:", hotelJson.errors);
            return [{ name: hotelJson.errors[0].title || "Could not retrieve hotels." }];
        }
        return []; // No hotels found
    }

    const formattedHotels = [];

    hotelJson.data.forEach(hotel => {
        const formattedHotel = {
            hotelId: hotel.hotelId,
            name: cleanHotelName(hotel.name), // Use the helper to clean the name
            distance: `${hotel.distance.value} ${hotel.distance.unit}` // e.g., "0.07 KM"
        };
        formattedHotels.push(formattedHotel);
    });

    return formattedHotels;
}

module.exports = formatHotels;
