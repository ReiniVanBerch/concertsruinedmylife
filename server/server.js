require('dotenv').config()



const { emitWarning } = require('process');
const fetchEvents = require('./files/api/modules/fetchevents.js');
const formatEvents = require('./files/api/modules/formatEvents.js');
const fetchMovies = require('./files/api/modules/__ref_fetchMovies.js');
const formatMovies = require('./files/api/modules/__ref_formatMovies.js');

const express = require('express');
const path = require('path');
const app = express();
const swaggerUi = require('swagger-ui-express');


//const swaggerDocument = require('./swagger.yaml');


//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



app.use(express.static(path.join(__dirname, 'files')));

app.get('/flights', async function (req, res) {
    req.query.time;
    res.send(formatMovies(await fetchMovies()));
});

app.get('/accomodations', async function (req, res) {
    res.send(formatMovies(await fetchMovies()));
});

app.get('/event', async function (req, res) {
    res.send(formatMovies(await fetchMovies()));
});

app.get('/eventtest/', async function (req, res) {
    const keyword = req.query.keyword;
    res.send(formatEvents(await fetchEvents(keyword)));
})

app.listen(3000, () => {
    console.log("Server now listening on http://localhost:3000/");
});


