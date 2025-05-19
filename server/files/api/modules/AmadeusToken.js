// amadeusTokenManager.js

const https = require('https'); // Using the built-in https module
const { URLSearchParams, URL } = require('url'); // Built-in URL utilities

// Best practice: Store credentials in environment variables
const AMADEUS_CLIENT_ID = process.env.AMADEUS_KEY; // Assuming you've set AMADEUS_KEY
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_SECRET; // Assuming you've set AMADEUS_SECRET
const tokenUrlString = 'https://test.api.amadeus.com/v1/security/oauth2/token';

let currentToken = null;
let tokenExpiryTime = 0; // Will store the timestamp when the token expires

/**
 * Fetches a new access token from Amadeus using the built-in https module.
 */
async function fetchNewAccessToken() {
    if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
        console.error("Amadeus client ID or secret is not configured in environment variables (AMADEUS_KEY, AMADEUS_SECRET).");
        throw new Error("Amadeus API credentials missing.");
    }

    const formParams = new URLSearchParams();
    formParams.append('grant_type', 'client_credentials');
    formParams.append('client_id', AMADEUS_CLIENT_ID);
    formParams.append('client_secret', AMADEUS_CLIENT_SECRET);

    const postData = formParams.toString(); // The body needs to be a string for https.request

    // Options for the https.request
    const urlObject = new URL(tokenUrlString);
    const options = {
        hostname: urlObject.hostname,
        path: urlObject.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData) // Important to set Content-Length
        }
    };

    // Wrap the https.request in a Promise to use with async/await
    return new Promise((resolve, reject) => {
        console.log("Fetching new Amadeus access token using 'https' module...");

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.setEncoding('utf8');

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const tokenData = JSON.parse(responseBody);
                        // tokenData example: { "access_token": "...", "expires_in": 1799, ... }

                        currentToken = tokenData.access_token;
                        const bufferSeconds = 60;
                        tokenExpiryTime = Date.now() + (tokenData.expires_in - bufferSeconds) * 1000;

                        console.log('New Amadeus access token obtained and stored.');
                        resolve(currentToken);
                    } else {
                        let errorDetails = responseBody;
                        try { errorDetails = JSON.parse(responseBody); } catch (e) { /* Keep as text if not JSON */ }
                        console.error('Error fetching Amadeus token:', res.statusCode, errorDetails);
                        reject(new Error(`Failed to fetch Amadeus access token: ${res.statusCode}`));
                    }
                } catch (parseError) {
                    console.error('Error parsing token response:', parseError, "Raw response:", responseBody);
                    reject(new Error('Error parsing token response from Amadeus.'));
                }
            });
        });

        req.on('error', (error) => {
            console.error('HTTPS request error for Amadeus token:', error.message);
            reject(new Error(`HTTPS request error: ${error.message}`));
        });

        // Write data to request body
        req.write(postData);
        // End the request to send it
        req.end();
    })
        .catch(error => { // Catch errors from the Promise wrapper (e.g., network, parsing, HTTP status)
            console.error('Exception in fetchNewAccessToken (https):', error.message);
            // Nullify current token on failure to ensure retry
            currentToken = null;
            tokenExpiryTime = 0;
            throw error; // Re-throw the error to be handled by getValidAccessToken
        });
}

/**
 * Retrieves the current valid Amadeus access token.
 * If the token is expired or not available, it fetches a new one.
 * @returns {Promise<string>} The Amadeus access token.
 */
async function getValidAccessToken() {
    if (currentToken && Date.now() < tokenExpiryTime) {
        // console.log('Returning existing valid Amadeus token.');
        return currentToken;
    } else {
        // console.log('Amadeus token is null, invalid, or expired. Fetching a new one.');
        return await fetchNewAccessToken(); // This now calls the https version
    }
}

module.exports = {
    getValidAccessToken
};

// --- Example Test Usage (optional, for direct testing of this file) ---
// async function testTokenFetch() {
//     // Ensure you have .env file with AMADEUS_KEY and AMADEUS_SECRET
//     // or set them as environment variables before running.
//     require('dotenv').config(); // npm install dotenv
//     try {
//         console.log("Attempting to fetch token using https module...");
//         const token = await getValidAccessToken();
//         console.log("Successfully fetched token:", token);
//         // Fetch again to test caching
//         console.log("\nAttempting to fetch token again (should be cached if not expired)...");
//         const cachedToken = await getValidAccessToken();
//         console.log("Second token fetch attempt:", cachedToken);

//     } catch (error) {
//         console.error("\nTest token fetch failed:", error.message);
//     }
// }

// If you want to test this file directly:
// testTokenFetch();