
const https = require('https');
const apiKey = process.env.TICKETMASTER_API_KEY;
var size = 5;
var api = "https://app.ticketmaster.com/discovery/v2/events.json";
//var keyword = ["Billie Eilish"];

async function fetchEvents(keyword) {


    return new Promise((resolve, reject) => {
        const url = `${api}?size=${size}&keyword=${keyword}&apikey=${apiKey}`;
        const events = [];

        https.get(url, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try {
                    //const event = JSON.parse(data); // Assuming response is JSON
                    resolve(data);
                } catch (error) {
                    reject(`Error parsing JSON for movie ${keyword}: ${error}`);
                }
            });
        }).on('error', (error) => {
            reject(`Error fetching data for ${keyword}: ${error}`);
        });
    });


    // Wait for all promises to resolve before returning movies

}


module.exports = fetchEvents;
/*
const https = require('https');

// It's better to define these outside the function for reusability and clarity
const API_BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const DEFAULT_SIZE = 5;

/**
 * Fetches events from the Ticketmaster API based on a keyword.
 *
 * @param {string} keyword - The keyword to search for (e.g., "Billie Eilish").
 * @param {string} apiKey - The Ticketmaster API key.
 * @param {number} [size=5] - The number of results to return. Defaults to 5.
 * @returns {Promise<any>} - A promise that resolves with the event data or rejects with an error.
 *
const fetchEvents = (keyword, apiKey, size = DEFAULT_SIZE) => {
    return new Promise((resolve, reject) => {
        // Construct the URL.  Use URLSearchParams for easier parameter handling.
        const url = `${API_BASE_URL}?size=${size}&keyword=${encodeURIComponent(keyword)}&apikey=${apiKey}`;

        https.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const eventData = JSON.parse(data);
                    resolve(eventData); // Resolve with the parsed data
                } catch (parseError) {
                    reject(new Error(`Error parsing Ticketmaster API response: ${parseError.message}`));
                }
            });
        }).on('error', (requestError) => {
            reject(new Error(`Error making Ticketmaster API request: ${requestError.message}`));
        });
    });
};

/**
 * Example usage of the fetchEvents function.

async function main() {
    //  Use environment variables for your API key

    const keyword = 'Billie Eilish'; //  Don't hardcode keywords.

    if (!apiKey) {
        console.error('TICKETMASTER_API_KEY is not set in the environment.');
        return; // Exit if the API key is missing
    }

    try {
        const eventsData = await fetchEvents(keyword, apiKey);
        // console.log(JSON.stringify(eventsData, null, 2)); //  pretty print
        if (eventsData && eventsData._embedded && eventsData._embedded.events) {
            console.log(`Found ${eventsData._embedded.events.length} events for "${keyword}":`);
            eventsData._embedded.events.forEach((event) => {
                    console.log(`- Event: ${event.name}, Date: ${event.dates.start.localDate}, Venue: ${event._embedded.venues[0].name}`);

                    return eventsData;
                }
            );
        }
        else if (eventsData && eventsData.page && eventsData.page.totalElements === 0) {
            console.log(`No events found for "${keyword}"`);
        }
        else {
            console.log("No events data available.");
        }

    } catch (error) {
        console.error('Error fetching events:', error); //  Use console.error for errors
    }
}

//  Call main
main();

module.exports = fetchEvents;
*/