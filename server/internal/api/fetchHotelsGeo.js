const https = require('https');
const tokenManager = require('./AmadeusToken.js');

const api = "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode";

/**
 * Fetches hotel data from the Amadeus API using geographic coordinates.
 * @param {string} POI - A string containing the longitude and latitude, formatted as "lon,lat".
 * @returns {Promise<string>} A promise that resolves with the raw hotel data string.
 */
async function fetchHotelsGeo(POI) {
    if (!POI || !POI.includes(',')) {
        return Promise.reject(new Error(`Invalid POI string provided: ${POI}`));
    }

    // --- THE FIX: Parse the POI string directly without substring ---
    // The POI parameter is already the coordinate string "lon,lat".
    const coordinatesArray = POI.split(',');

    const lonRaw = parseFloat(coordinatesArray[0]);
    const latRaw = parseFloat(coordinatesArray[1]);

    if (isNaN(latRaw) || isNaN(lonRaw)) {
        return Promise.reject(new Error(`Invalid coordinate format in POI string: ${POI}`));
    }

    // Truncate coordinates to a valid precision for the API
    const lat = latRaw.toFixed(5);
    const lon = lonRaw.toFixed(5);
    // --- End of fix ---

    const radius = 10;
    const radiusUnit = "KM";
    const hotelSource = "ALL";

    const bearerToken = await tokenManager.getValidAccessToken();
    return new Promise((resolve, reject) => {
        const url = `${api}?latitude=${lat}&longitude=${lon}&radius=${radius}&radiusUnit=${radiusUnit}&hotelSource=${hotelSource}`;

        console.log("Requesting URL:", url);

        const options = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        };

        https.get(url, options, (response) => {
            let data = '';

            if (response.statusCode >= 300) {
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    let detailedError = `API request failed with status code ${response.statusCode}`;
                    try {
                        const errorJson = JSON.parse(data);
                        if (errorJson.errors && errorJson.errors[0]) {
                            detailedError += `: ${errorJson.errors[0].title} - ${errorJson.errors[0].detail}`;
                        }
                    } catch (e) {
                        detailedError += `\nResponse body: ${data}`;
                    }
                    reject(new Error(detailedError));
                });
                return;
            }

            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                const hotels = JSON.parse(data);
                resolve(hotels);
            });
        }).on('error', (error) => {
            reject(`Error fetching data for POI ${POI}: ${error}`);
        });
    });
}

module.exports = fetchHotelsGeo;
