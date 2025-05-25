require('dotenv').config()


const express = require('express');
const session = require('express-session');

const path = require('path');
const app = express();
const swaggerUi = require('swagger-ui-express');

const { emitWarning } = require('process');

const fetchEvents = require('./files/api/modules/fetchevents.js');
const formatEvents = require('./files/api/modules/formatEvents.js');
const fetchFlights = require('./files/api/modules/fetchFlights.js');
const formatMovies = require('./files/api/modules/__ref_formatMovies.js');
const eventDetails = require('./files/api/modules/fetcheventdetails.js');
const formatEventDetails = require('./files/api/modules/formatEventDetails.js');




//const swaggerDocument = require('./swagger.yaml');

//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));


 app.get("/", (req, res) =>{
    if(!req.session.sessionID){
        let id = require('crypto').randomBytes(32).toString('hex');
        res.sendFile(path.join(__dirname, '../server/files/index.html'));
        console.log(id);
        return id;
    }

 })


app.use(express.static(path.join(__dirname, 'files')));

app.get('/flights', async function (req, res) {
    res.send((await fetchFlights()));
});

app.get('/accomodations', async function (req, res) {
    res.send(formatMovies(await fetchMovies()));
});



app.get('/event/', async function (req, res) {
    const keyword = req.query.keyword;
    try {
        const eventsData = await fetchEvents(keyword);
        console.log('Type of eventsData:', typeof eventsData);
        console.log('Content of eventsData:', eventsData);
        const formattedData = formatEvents(eventsData);
        res.status(200).send(formattedData); // Send status with data
    } catch (error) {
        console.error(`Error in /eventtest/ for keyword "${keyword}":`, error);
        res.status(500).send({ message: "An error occurred on the server.", details: error.message });
    }
})

app.get('/eventdetails/:eventID', async function (req, res) {
    res.status(200);
    res.send(formatEventDetails(await eventDetails(req.params.eventID)));
})

app.listen(3000, () => {
    console.log("Server now listening on http://localhost:3000/");
});


