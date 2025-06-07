const https = require('https');
const tokenManager = require('./AmadeusToken.js');


var api = "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city";
//var keyword = ["Billie Eilish"];

async function fetchHotels(cityCode) {
    const radius = 40;
    const radiusUnit = "KM";
    const hotelSource = "ALL";
    const bearerToken = await tokenManager.getValidAccessToken();
    return new Promise((resolve, reject) => {
        const url = `${api}?cityCode=${cityCode}&radius=${radius}&radiusUnit=${radiusUnit}&hotelSource=${hotelSource}`;
        const flights = [];
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
                    reject(`Error parsing JSON for movie ${cityCode}: ${error}`);
                }
            });
        }).on('error', (error) => {
            reject(`Error fetching data for ${cityCode}: ${error}`);
        });
    });


    // Wait for all promises to resolve before returning movies

}


module.exports = fetchHotels;