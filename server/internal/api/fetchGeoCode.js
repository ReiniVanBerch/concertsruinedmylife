const https = require('https');
const API_KEY = process.env.GEOFY_API_KEY;


var api = "https://api.geoapify.com/v1/geocode/";

async function fetchGeocode(POINT_NAME ) {


    return new Promise((resolve, reject) => {
        const url = `${api}search?text=${POINT_NAME}&apiKey=${API_KEY}`;
        https.get(url, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try {
                    //const event = JSON.parse(data); // Assuming response is JSON
                    resolve(data);
                } catch (error) {
                    reject(`Error parsing JSON for Geoppoint ${POINT_NAME}: ${error}`);
                }
            });
        }).on('error', (error) => {
            reject(`Error fetching data for ${POINT_NAME}: ${error}`);
        });
    });


    // Wait for all promises to resolve before returning movies

}


module.exports = fetchGeocode;