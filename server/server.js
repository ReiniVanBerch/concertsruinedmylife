const fetchMovies = require('./files/api/modules/fetchMovies.js');
const formatMovies = require('./files/api/modules/formatMovies.js');

const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'files')));

app.get('/flights', async function (req, res) {res.send(formatMovies(await fetchMovies()));});
app.get('/accomodations', async function (req, res) {res.send(formatMovies(await fetchMovies()));});


app.listen(3000, () => {
    console.log("Server now listening on http://localhost:3000/");
});
