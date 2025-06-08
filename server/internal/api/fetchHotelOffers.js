/*
File: ./api/fetchHotelOffers.js
This function performs the mass request for multiple hotel offers.
*/
const https = require('https');
const tokenManager = require('./AmadeusToken.js');

const api = "https://test.api.amadeus.com/v3/shopping/hotel-offers";

/**
 * Fetches hotel offers for a list of hotel IDs in a single API call.
 * Handles 400 errors by returning an empty data object, as this often means no availability.
 * @param {string[]} hotelIds - An array of hotel IDs.
 * @param {string} checkin - Check-in date in YYYY-MM-DD format.
 * @param {string} checkout - Check-out date in YYYY-MM-DD format.
 * @param {number} adults - Number of adults.
 * @param {number} rooms - Number of rooms.
 * @returns {Promise<string>} A promise that resolves with the raw JSON string from the API.
 */
async function fetchHotelOffers(hotelIds, checkin, checkout, adults, rooms) {
    // Join the array of IDs into a single comma-separated string for the API call
    const hotelIdsString = hotelIds.join(',');

    const paymentPolicy = "NONE";
    const bestRateOnly = true;

    const bearerToken = await tokenManager.getValidAccessToken();
    return new Promise((resolve, reject) => {
        const url = `${api}?hotelIds=${hotelIdsString}&adults=${adults}&checkInDate=${checkin}&checkOutDate=${checkout}&roomQuantity=${rooms}&paymentPolicy=${paymentPolicy}&bestRateOnly=${bestRateOnly}`;

        console.log("Requesting Hotel Offers URL:", url); // For debugging

        const options = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        };

        https.get(url, options, (response) => {
            let data = '';

            // --- GRACEFUL ERROR HANDLING ---
            // If the status is 400, it likely means no rooms are available.
            // Instead of failing, we resolve with an empty data structure.
            if (response.statusCode === 400) {
                console.warn(`Received 400 Bad Request for hotel IDs. Assuming no availability.`);
                resolve(JSON.stringify({ data: [] })); // Return a valid but empty JSON structure
                return;
            }

            // For other errors, we still want to reject the promise.
            if (response.statusCode >= 300) {
                reject(new Error(`API request failed with status code ${response.statusCode}`));
                return;
            }

            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                resolve(data);
            });
        }).on('error', (error) => {
            reject(`Error fetching hotel offers: ${error}`);
        });
    });
}

module.exports = fetchHotelOffers;
