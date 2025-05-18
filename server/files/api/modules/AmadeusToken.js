// amadeusTokenManager.js

const fet = require('node-fetch'); // Or your preferred HTTP client like axios

// Best practice: Store credentials in environment variables
const AMADEUS_CLIENT_ID = process.env.AMADEUS_KEY;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_SECRET;
const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';

let currentToken = null;
let tokenExpiryTime = 0; // Will store the timestamp when the token expires

/**
 * Fetches a new access token from Amadeus.
 */
async function fetchNewAccessToken() {
    if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
        console.error("Amadeus client ID or secret is not configured in environment variables.");
        throw new Error("Amadeus API credentials missing.");
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', AMADEUS_CLIENT_ID);
    params.append('client_secret', AMADEUS_CLIENT_SECRET);

    try {
        console.log("Fetching new Amadeus access token...");
        const response = await fet(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        if (!response.ok) {
            let errorDetails = await response.text();
            try { errorDetails = JSON.parse(errorDetails); } catch (e) { /* Keep as text */ }
            console.error('Error fetching Amadeus token:', response.status, errorDetails);
            throw new Error(`Failed to fetch Amadeus access token: ${response.status}`);
        }

        const tokenData = await response.json();
        // tokenData example: { "access_token": "...", "expires_in": 1799, ... }

        currentToken = tokenData.access_token;
        // expires_in is in seconds. Calculate expiry time.
        // Add a small buffer (e.g., 60 seconds) to refresh token before it actually expires.
        const bufferSeconds = 60;
        tokenExpiryTime = Date.now() + (tokenData.expires_in - bufferSeconds) * 1000;

        console.log('New Amadeus access token obtained and stored.');
        return currentToken;

    } catch (error) {
        console.error('Exception in fetchNewAccessToken:', error.message);
        // Nullify current token on failure to ensure retry
        currentToken = null;
        tokenExpiryTime = 0;
        throw error;
    }
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
        return await fetchNewAccessToken();
    }
}

module.exports = {
    getValidAccessToken
};