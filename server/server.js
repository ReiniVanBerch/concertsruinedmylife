require('dotenv').config()

const bcrypt = require('bcrypt');
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// --- Swagger Integration ---
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs'); // Use the yamljs library
let swaggerDocument = YAML;
try {
    swaggerDocument = YAML.load('./swagger.yaml');
} catch (e) {
    swaggerDocument = YAML.load('./server/swagger.yaml');
}

const { emitWarning } = require('process');

// Internal API and Database modules
const fetchEvents = require('./internal/api/fetchevents.js');
const formatEvents = require('./internal/api/formatEvents.js');
const fetchFlights = require('./internal/api/fetchFlights.js');
const formatMovies = require('./internal/api/__ref_formatMovies.js');
const eventDetails = require('./internal/api/fetcheventdetails.js');
const formatEventDetails = require('./internal/api/formatEventDetails.js');
const formatFlight = require('./internal/api/formatFlight.js');
const fetchAirport = require('./internal/api/fetchAirports.js');

const login = require('./internal/database/login.js');
const register = require('./internal/database/register.js');
const ensureAuthenticated = require('./internal/database/ensureAuthenticated.js');

const eventCostpoints = require('./internal/database/costpoint/allCostpoints.js');
const allCostpoints = require('./internal/database/costpoint/allCostpoints.js');
const putCostpoint = require('./internal/database/costpoint/putCostpoint.js');
const getCostpoint = require('./internal/database/costpoint/getCostpoint.js');
const deleteCostpoint = require('./internal/database/costpoint/deleteCostpoint.js');

const allEvents = require('./internal/database/events/allEvents.js');
const putEvent = require('./internal/database/events/putEvent.js');
const getEvent = require('./internal/database/events/getEvent.js');
const deleteEvent = require('./internal/database/events/deleteEvent.js');

const fetchHotels = require("./internal/api/fetchHotels");
const formatHotels = require("./internal/api/formatHotels");
const fetchGeoCode=require("./internal/api/fetchGeoCode.js");
const fetchAirportGeo =require("./internal/api/fetchAirportGeo.js");
const fetchHotelsGeo =require("./internal/api/fetchHotelsGeo.js");
const fetchHotelDetails = require("./internal/api/fetchHotelOffers.js");
const fetchHotelOffers = require("./internal/api/fetchHotelOffers.js");
const { formatHotelOffers } = require("./internal/api/hotelOfferFormatter.js");


// --- Middleware Setup ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Use the loaded document
app.use(express.json());
app.use(express.static(path.join(__dirname, 'files')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using https
}));



app.get('/flights', async function (req, res) {
    const { from, to, departDate, returnDate, adults, children } = req.query;
    res.send((formatFlight(await fetchFlights(from, to, departDate, returnDate, adults, children))));
});

app.get('/accomodations', async function (req, res) {7
    const { cityCode } = req.query;
    res.send((await fetchHotels(cityCode)));
});

app.get('/accomodationsgeo', async function (req, res) {7
    const { POI } = req.query;
    res.send((await fetchHotelsGeo(POI)));
});

app.get('/accomodationsdetails', async function (req, res) {7
    const { hotelid, checkin, checkout,adults,rooms } = req.query;
    res.send((await fetchHotelDetails(hotelid, checkin, checkout,adults,rooms)));
});

app.get('/accomodationsoffers', async (req, res) => {
    const { hotelIds, checkin, checkout, adults, rooms } = req.query;

    if (!hotelIds) {
        return res.status(400).send({ message: "Hotel IDs are required." });
    }

    // The hotelIds will be a comma-separated string, so we split it into an array
    const hotelIdArray = hotelIds.split(',');

    const rawData = await fetchHotelOffers(hotelIdArray, checkin, checkout, adults, rooms);
    const formattedData = formatHotelOffers(rawData);

    res.send(formattedData);
});

app.get('/geoloc', async function (req, res) {7
    const { POI } = req.query;
    res.send(await fetchGeoCode(POI));
});

app.get('/geolocairport', async function (req, res) {7
    const { POI } = req.query;
    res.send(await fetchAirportGeo(POI));
});



app.get('/airport/:airport', async function (req, res) {
    res.send(await fetchAirport(req.params.airport));
})


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
    res.send(formatEventDetails(await eventDetails(req.params.eventID)));
})

//UserThingos
//Login and Register
app.post('/login', async (req, res) => {
    login(req, res);
});

app.get('/logout', async (req, res) => {
    req.session.destroy();
    res.status(200).send("LoggedOut");
});

app.post('/register', async (req, res) => {
    register(req, res);
});

app.get('/auth', (req, res) => {
    if (req.session.username) {
        res.status(200).send("Everything good!");
    } else {
        res.status(402).send('notPermitted');
    }
});

//See if loggedIn, and if username
app.get('/profile', (req, res) => { ensureAuthenticated(req, res, () => { res.redirect(302, '/profile.html'); }); });


//Get Events assigned to User
app.get('/profile/events', async function (req, res) { ensureAuthenticated(req, res, allEvents); })

//Get Specific Evetn assigned to user
app.get('/profile/events/:event', async function (req, res) { ensureAuthenticated(req, res, getEvent); })

//Add an event to user
app.put('/profile/events', async function (req, res) { ensureAuthenticated(req, res, putEvent); })

//Remove an event to user
app.delete('/profile/events/:event', async function (req, res) { ensureAuthenticated(req, res, deleteEvent); })


//Get all costpoints of a user
app.get('/profile/events/costpoints', async function (req, res) { ensureAuthenticated(req, res, allCostpoints); })

//Get all costpoints belonging to an event 
app.get('/profile/events/:event/costpoints', async function (req, res) { ensureAuthenticated(req, res, eventCostpoints); })

//Get a specific sotpoint of a spcific event
app.get('/profile/events/:costpoint', async function (req, res) { ensureAuthenticated(req, res, getCostpoint); })

//Add a costpoint to user
app.put('/profile/events/:event/:costpoint', async function (req, res) { ensureAuthenticated(req, res, putCostpoint); })

//Remove an event to user
app.delete('/profile/events/:costpoint', async function (req, res) { ensureAuthenticated(req, res, deleteCostpoint); })


// --- Server Start ---
app.listen(3000, () => {
    console.log("Server now listening on http://localhost:3000/");
    console.log("API documentation available at http://localhost:3000/api-docs");
});