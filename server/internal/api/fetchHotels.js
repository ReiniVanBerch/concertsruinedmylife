const https = require('https');
const tokenManager = require('./AmadeusToken.js');


var api = "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city";
//var keyword = ["Billie Eilish"];

async function fetchHotels(cityCode) {
    const radius = 3;
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
        https.get(url, options, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try {
                    const amadeusResult = JSON.parse(data); // API response
                    const formattedHotels = (amadeusResult.data || []).map(hotel => ({
                        hotelId: hotel.hotelId,
                        name: hotel.name,
                        latitude: hotel.geoCode?.latitude ?? null,
                        longitude: hotel.geoCode?.longitude ?? null,
                        address: hotel.address ? hotel.address.lines ? hotel.address.lines.join(', ') : '' : ''
                    }));
                    // Return as { data: [...] } for compatibility
                    resolve({ data: formattedHotels });
                } catch (error) {
                    reject(`Error parsing hotel data: ${error}`);
                }
            });
        })
    });


    // Wait for all promises to resolve before returning movies

}


module.exports = fetchHotels;