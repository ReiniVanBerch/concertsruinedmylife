require('dotenv').config();

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


//stuuuuuuuuuuuff
const login = require('./internal/database/user/login.js');
const register = require('./internal/database/user/register.js');
const ensureAuthenticated = require('./internal/database/user/ensureAuthenticated.js');

const eventCostpoints = require('./internal/database/costpoint/allCostpoints.js');
const allCostpoints = require('./internal/database/costpoint/allCostpoints.js');
const putCostpoint = require('./internal/database/costpoint/putCostpoint.js');
const getCostpoint = require('./internal/database/costpoint/getCostpoint.js');
const deleteCostpoint = require('./internal/database/costpoint/deleteCostpoint.js');

const allEvents = require('./internal/database/events/allEvents.js');
const putEvent = require('./internal/database/events/putEvent.js');
const getEvent = require('./internal/database/events/getEvent.js');
const deleteEvent = require('./internal/database/events/deleteEvent.js');

const adminLogin = require('./internal/database/admin/adminLogin.js');
const ensureAdmin = require('./internal/database/admin/ensureAdmin.js');
const deleteUser = require('./internal/database/admin/deleteUser.js');
const allUsers = require('./internal/database/admin/allUsers.js');




const fetchHotels = require("./internal/api/fetchHotels");
const formatHotels = require("./internal/api/formatHotels");
const fetchGeoCode=require("./internal/api/fetchGeoCode.js");
const fetchAirportGeo =require("./internal/api/fetchAirportGeo.js");
const fetchHotelsGeo =require("./internal/api/fetchHotelsGeo.js");
const fetchHotelDetails = require("./internal/api/fetchHotelOffers.js");
const fetchHotelOffers = require("./internal/api/fetchHotelOffers.js");
const { formatHotelOffers } = require("./internal/api/hotelOfferFormatter.js");
const contentNegotiation = require('./internal/middleware/contentNegotiation.js');



// --- Middleware Setup ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Use the loaded document
app.use(express.json());
app.use(contentNegotiation);
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



/* User
U   U   SSSS  EEEEE  RRRR
U   U  S      E      R   R
U   U   SSS   EEEE   RRRR
U   U      S  E      R   R
 UUU   SSSS   EEEEE  R   R
*/
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

/* Admin
 AAA   DDDD   M   M  IIIII  N   N
A   A  D   D  MM MM    I    NN  N
AAAAA  D   D  M M M    I    N N N
A   A  D   D  M   M    I    N  NN
A   A  DDDD   M   M  IIIII  N   N
*/
app.delete("/admin/:user", (req, res) => {
    ensureAdmin(req, res, deleteUser);
});


app.get('/admin/users', (req, res) => {
    ensureAdmin(req, res, allUsers);
});


//Admin login!
//The link is the first layer of security, the second is the code. 
app.get('/admin/3f9a7c8e2d6b1f4a9e0d7c3b5a8f2e6d1c4b9a0f7d3e5c8b2a1f6d9e7c0b4a3/:admin', (req, res) => {
    adminLogin(req, res);
});


//See if loggedIn, and if username
app.get('/profile', (req, res) => {
    ensureAuthenticated(req, res, () => {
        res.redirect(302, '/profile.html');
    });
});


/* Event
EEEEE  V   V  EEEEE  N   N  TTTTT
E      V   V  E      NN  N    T
EEEE    V V   EEEE   N N N    T
E       V V   E      N  NN    T
EEEEE    V    EEEEE  N   N    T
*/

//Get Events assigned to User
app.get('/profile/events', async function (req, res) { ensureAuthenticated(req, res, allEvents); })

//Get Specific Evetn assigned to user
app.get('/profile/events/:event', async function (req, res) { ensureAuthenticated(req, res, getEvent); })

//Add an event to user
app.put('/profile/events', async function (req, res) { ensureAuthenticated(req, res, putEvent); })

//Remove an event to user
app.delete('/profile/events/:event', async function (req, res) { ensureAuthenticated(req, res, deleteEvent); })




/* Costpoints
 CCC    OOO    SSSS  TTTTT  PPPP    OOO   IIIII  N   N TTTTT   SSSS
C   C  O   O  S        T    P   P  O   O    I    NN  N   T    S
C      O   O   SSS     T    PPPP   O   O    I    N N N   T     SSS
C   C  O   O      S    T    P      O   O    I    N  NN   T        S
 CCC    OOO   SSSS     T    P       OOO   IIIII  N   N   T    SSSS
*/

//Get all costpoints of a user
app.get('/profile/costpoints', async function (req, res) { ensureAuthenticated(req, res, allCostpoints); })

//Get all costpoints belonging to an event 
app.get('/profile/events/:event/costpoints', async function (req, res) { ensureAuthenticated(req, res, eventCostpoints); })

//Get a specific sotpoint of a spcific event
app.get('/profile/:costpoint', async function (req, res) { ensureAuthenticated(req, res, getCostpoint); })

//Add a costpoint to user
app.put('/profile/costpoint', async function (req, res) { ensureAuthenticated(req, res, putCostpoint); })

//Remove an event to user
app.delete('/profile/costpoint/:costpoint', async function (req, res) { ensureAuthenticated(req, res, deleteCostpoint); })


// --- Server Start ---
app.listen(3000, () => {
    console.log("Server now listening on http://localhost:3000/");
    console.log("API documentation available at http://localhost:3000/api-docs");
});