const https = require('https');

var api = "https://www.omdbapi.com/?apikey=4b2ba2bc";
var movieIDs = ["tt0120737", "tt0167261", "tt0167260"];

async function fetchMovies() {
    const movies = [];
    const moviePromises = movieIDs.map(movieID => {
        return new Promise((resolve, reject) => {
            const url = `${api}&i=${movieID}`;

            https.get(url, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        const movie = JSON.parse(data); // Assuming response is JSON
                        movies.push(movie);
                        resolve();
                    } catch (error) {
                        reject(`Error parsing JSON for movie ${movieID}: ${error}`);
                    }
                });
            }).on('error', (error) => {
                reject(`Error fetching data for ${movieID}: ${error}`);
            });
        });
    });

    // Wait for all promises to resolve before returning movies
    await Promise.all(moviePromises);

    return JSON.stringify(movies);
}


module.exports = fetchMovies;
