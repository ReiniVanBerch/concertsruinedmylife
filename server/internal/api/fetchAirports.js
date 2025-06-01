const https = require('https');
const tokenManager = require('./AmadeusToken.js');


var api = "https://test.api.amadeus.com/v1/reference-data/";

async function fetchAirports(City, ) {

    const bearerToken = await tokenManager.getValidAccessToken();
    return new Promise((resolve, reject) => {
        const url = `${api}locations?subType=AIRPORT&keyword=${City}`;
        const airports = [];
        const options = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        }
        https.get(url,options, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try {
                    //const event = JSON.parse(data); // Assuming response is JSON
                    resolve(data);
                } catch (error) {
                    reject(`Error parsing JSON for Airport ${City}: ${error}`);
                }
            });
        }).on('error', (error) => {
            reject(`Error fetching data for ${City}: ${error}`);
        });
    });


    // Wait for all promises to resolve before returning movies

}


module.exports = fetchAirports;