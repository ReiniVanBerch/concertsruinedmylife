const fetchMovies = require('./fetchMovies.js');
const formatMovies = require('./formatMovies.js');

const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'files')));

app.get('/', async function (req, res) {
    res.send("Hellowo");
});

app.listen(3000, () => {
    console.log("Server now listening on http://localhost:3000/");
});
