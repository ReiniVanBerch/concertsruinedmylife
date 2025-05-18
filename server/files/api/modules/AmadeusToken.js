const fetch = require('node-fetch'); // For CommonJS modules (typical Node.js)
// If you are using ES Modules (e.g., "type": "module" in package.json):
// import fetch from 'node-fetch';

// Your Amadeus API Credentials - Replace with your actual credentials
const AMADEUS_CLIENT_ID = process.env.AMADEUS_KEY;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_SECRET;

const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';

async function AmadeusToken() {
    // Prepare the data for x-www-form-urlencoded body
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', AMADEUS_CLIENT_ID);
    params.append('client_secret', AMADEUS_CLIENT_SECRET);

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params // URLSearchParams will be correctly stringified
        });

        if (!response.ok) {
            // Try to get more details from the error response body
            let errorDetails = await response.text(); // Get raw text first
            try {
                errorDetails = JSON.parse(errorDetails); // Try to parse as JSON
            } catch (e) {
                // If not JSON, use the raw text
            }
            console.error('Error response details:', errorDetails);
            throw new Error(`Failed to fetch access token: ${response.status} ${response.statusText}`);
        }

        const tokenData = await response.json();
        console.log('Access Token Info:', tokenData);
        // Typically, you'll want to return the access_token and possibly expires_in
        // tokenData will look something like:
        // {
        //   "type": "amadeusOAuth2Token",
        //   "username": "your_email@example.com",
        //   "application_name": "Your Application Name",
        //   "client_id": "YOUR_AMADEUS_API_KEY",
        //   "token_type": "Bearer",
        //   "access_token": "VERY_LONG_TOKEN_STRING",
        //   "expires_in": 1799, // Typically in seconds (e.g., 30 minutes)
        //   "state": "approved",
        //   "scope": ""
        // }
        return tokenData.access_token; // Or the whole object if you need more info

    } catch (error) {
        console.error('Error in getAmadeusAccessToken:', error.message);
        throw error; // Re-throw the error to be handled by the caller
    }
}