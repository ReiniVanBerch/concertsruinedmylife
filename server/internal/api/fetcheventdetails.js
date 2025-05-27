
const https = require('https');
const apiKey = process.env.TICKETMASTER_API_KEY;

var api = "https://app.ticketmaster.com/discovery/v2/events/";


async function fetchEvents(eventID) {


        return new Promise((resolve, reject) => {
            const url = `${api}${eventID}.json?apikey=${apiKey}`;
            const events = [];

            https.get(url, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        //const event = JSON.parse(data); // Assuming response is JSON
                        resolve(data);
                    } catch (error) {
                        reject(`Error parsing JSON for Event ${eventID}: ${error}`);
                    }
                });
            }).on('error', (error) => {
                reject(`Error fetching data for ${eventID}: ${error}`);
            });
        });


    // Wait for all promises to resolve before returning movies

}


module.exports = fetchEvents;
