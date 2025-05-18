const https = require('https');
const tokenManager = require('./AmadeusToken.js');

var passengers = 2;
var returns = 5;
var api = "https://test.api.amadeus.com/v2/shopping/flight-offers";
//var keyword = ["Billie Eilish"];

async function fetchFlights(Depa, Dest, Depadate, ReturnDate) {

    const bearerToken = await tokenManager.getValidAccessToken();
    return new Promise((resolve, reject) => {
        const url = `${api}?originLocationCode=${Depa}&destinationLocationCode=${Desr}&departureDate={${Depadate}}&returnDate={${ReturnDate}}&adults=${passengers}&max=${returns}`;
        const flights = [];
        https.header = {
            'Authorization': `Bearer ${bearerToken}`
        }
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


module.exports = fetchFlights;