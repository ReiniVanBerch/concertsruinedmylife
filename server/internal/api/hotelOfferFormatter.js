/**
 * Helper function to clean text from the API response.
 * @param {string} text - The text to clean.
 * @returns {string} The cleaned text.
 */
function cleanText(text) {
    if (!text) return 'No description available.';
    return text.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, ' ').trim();
}

/**
 * Parses the raw JSON from a mass hotel offer search and returns a clean array.
 * @param {string} rawOfferData - The raw JSON string from the fetchHotelOffers function.
 * @returns {Array<object>} An array of formatted hotel offers.
 */
function formatHotelOffers(rawOfferData) {
    const offerJson = JSON.parse(rawOfferData);

    if (!offerJson.data || offerJson.data.length === 0) {
        return []; // Return an empty array if no offers were found
    }

    const formattedOffers = [];

    offerJson.data.forEach(hotelData => {
        // Skip this hotel if it's not available or has no offers
        if (!hotelData.available || !hotelData.offers || hotelData.offers.length === 0) {
            return;
        }

        const firstOffer = hotelData.offers[0];

        formattedOffers.push({
            hotelId: hotelData.hotel.hotelId,
            name: cleanText(hotelData.hotel.name),
            price: firstOffer.price.total,
            currency: firstOffer.price.currency,
            description: cleanText(firstOffer.room.description.text)
        });
    });

    return formattedOffers;
}

module.exports.formatHotelOffers = formatHotelOffers; // Exporting both from one example file
