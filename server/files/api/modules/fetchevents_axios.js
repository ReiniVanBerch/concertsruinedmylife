const axios = require('axios');
const {locals} = require("express/lib/application");
const events = require("node:events");
const apiKey = `${process.env.TICKETMASTER_API_KEY}`;
/**
 * Fetches events from Ticketmaster API based on a keyword.
 *
 * @param {string} keyword - The keyword to search for (e.g., "Billie Eilish").
 * @param {string} apiKey - The Ticketmaster API key.
 * @param {number} size - The number of results to return. Defaults to 8.
 * @returns {Promise<any>} - A promise that resolves with the API response data,
 * or rejects with an error.  Returns null on error.
 */
const getEventsByKeyword = async (keyword, apiKey, size = 8) => {
    try {

        const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?size=${size}&keyword=${encodeURIComponent(keyword)}&apikey=${apiKey}`;


        const response = await axios.get(apiUrl);


        if (response.status === 200) {
            return response.data;
        } else {

            console.error(`Ticketmaster API error: ${response.status} - ${response.statusText}`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        return null;
    }
};

/**
 * Example usage of the getEventsByKeyword function.
 */
const fetchevents_axios = async () =>{

    const keyword = 'Billie Eilish'; // The keyword to search for
    const size = 10; // Example of changing the size

    // Call the function and handle the result using await.
    const eventsData = await getEventsByKeyword(keyword, apiKey, size);

    if (eventsData) {
        // Process the events data.  Check for the existence of _embedded.events
        if (eventsData._embedded && eventsData._embedded.events) {
            console.log('Events Data:', eventsData._embedded.events);
            //  Iterate through the events and print out some info.
            eventsData._embedded.events.forEach(event => {
                console.log(`Event Name: ${event.name}`);
                console.log(`  Date: ${event.dates.start.localDate}`);
                console.log(`  Venue: ${event._embedded.venues[0].name}`);
                console.log(`--------------------------`);
            });
        } else {
            console.log('No events found for the given keyword.');
        }
    } else {
        // Handle the case where the API request failed (getEventsByKeyword returned null).
        console.error('Failed to retrieve events.  Check the API key and keyword.');
    }
};

// Run the main function.
module.exports = fetchevents_axios;