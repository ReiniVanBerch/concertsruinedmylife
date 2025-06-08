const https = require('https');
const tokenManager = require('./AmadeusToken.js');

const api = "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode";

/**
 * Fetches hotel data from the Amadeus API using geographic coordinates.
 * @param {string} POI - A string containing the longitude and latitude, formatted as "POI=lon,lat".
 * @returns {Promise<string>} A promise that resolves with the raw hotel data string.
 */
async function fetchHotelsGeo(POI) {
    // --- Inline logic to parse the POI string ---
    if (!POI || !POI.includes(',')) {
        return Promise.reject(new Error(`Invalid POI string provided: ${POI}`));
    }
    const coordinatesString = POI.substring(4);
    const coordinatesArray = coordinatesString.split(',');

    const lonRaw = parseFloat(coordinatesArray[0]);
    const latRaw = parseFloat(coordinatesArray[1]);

    if (isNaN(latRaw) || isNaN(lonRaw)) {
        return Promise.reject(new Error(`Invalid coordinate format in POI string: ${POI}`));
    }

    // --- THE FIX: Truncate coordinates to 5 decimal places ---
    const lat = latRaw.toFixed(5);
    const lon = lonRaw.toFixed(5);
    // --- End of fix ---


    const radius = 10;
    const radiusUnit = "KM";
    const hotelSource = "ALL";

    const bearerToken = await tokenManager.getValidAccessToken();
    return new Promise((resolve, reject) => {
        // Use the numeric lat and lon variables to build the correct URL.
        const url = `${api}?latitude=${lat}&longitude=${lon}&radius=${radius}&radiusUnit=${radiusUnit}&hotelSource=${hotelSource}`;

        // --- DEBUGGING STEP: Log the final URL to the console ---
        console.log("Requesting URL:", url);

        const options = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        };

        https.get(url, options, (response) => {
            let data = '';

            // --- DETAILED ERROR LOGGING: Read the body of a failed request ---
            if (response.statusCode >= 300) {
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    let detailedError = `API request failed with status code ${response.statusCode}`;
                    try {
                        const errorJson = JSON.parse(data);
                        // Amadeus often provides an 'errors' array
                        if (errorJson.errors && errorJson.errors[0]) {
                            detailedError += `: ${errorJson.errors[0].title} - ${errorJson.errors[0].detail}`;
                        }
                    } catch (e) {
                        // Could not parse the error body, but still log what we have
                        detailedError += `\nResponse body: ${data}`;
                    }
                    reject(new Error(detailedError));
                });
                return;
            }

            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                resolve(data);
            });
        }).on('error', (error) => {
            // FIX: Corrected error message to use the right variable
            reject(`Error fetching data for POI ${POI}: ${error}`);
        });
    });
}

module.exports = fetchHotelsGeo;
