require('dotenv').config()

const bcrypt = require('bcrypt');


const express = require('express');
const session = require('express-session');

const path = require('path');
const app = express();
const swaggerUi = require('swagger-ui-express');

const { emitWarning } = require('process');

const fetchEvents = require('./internal/api/fetchevents.js');
const formatEvents = require('./internal/api/formatEvents.js');
const fetchFlights = require('./internal/api/fetchFlights.js');
const formatMovies = require('./internal/api/__ref_formatMovies.js');
const eventDetails = require('./internal/api/fetcheventdetails.js');
const formatEventDetails = require('./internal/api/formatEventDetails.js');

const login = require('./internal/database/login.js');
const register = require('./internal/database/register.js');
const allEvents = require('./internal/database/allEvents.js');

//const swaggerDocument = require('./swagger.yaml');

//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'files')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));






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
    session.
    res.status(200);
    res.send(formatEventDetails(await eventDetails(req.params.eventID)));
})




//UserThingos
//Login and Register
app.post('/login/', async (req, res) => {
    login(req, res);
});

app.post('/register/', async (req, res) => {
    register(req, res);
});


//See if loggedIn, and if username
app.get('/profile/', (req, res) => {
  if (!req.session.username) {
    res.status(401).send({success: false, message: 'Not logged in'});
  }else{
    res.status(200).send({success: true, message: `Welcome, ${req.session.username}`});
  }
});

//Get Events assigned to User
app.get('/profile/events/', async function (req, res) {
    allEvents(req, res);
})

//Get Specific Evetn assigned to user
app.get('/profile/events/:event', async function (req, res) {
    res.status(501).send("Yet to be implemented!, but right location");
})

//Add an event to user
app.put('/profile/events/add/:event', async function (req, res) {
    res.status(501).send("Yet to be implemented!, but right location");
})

//Remove an event to user
app.delete('/profile/events/:event/', async function (req, res) {
    res.status(501).send("Yet to be implemented!, but right location");
})

//Add a costfactor to an event
app.put('/profile/events/:event/:costfactor', async function (req, res) {
    res.status(501).send("Yet to be implemented!, but right location");
})

//modify a costfactor to an event
app.patch('/profile/events/:event/:costfactor', async function (req, res) {
    res.status(501).send("Yet to be implemented!, but right location");
})


//remove a costfactor from an event
app.delete('/profile/events/:event/:costfactor', async function (req, res) {
    res.status(501).send("Yet to be implemented!, but right location");
})

app.listen(3000, () => {
    console.log("Server now listening on http://localhost:3000/");
});


