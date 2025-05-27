require('dotenv').config()

const bcrypt = require('bcrypt');


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

const loginUser = require('./files/database/login.js');
const registerUser = require('./files/database/register.js');


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
//Login
app.post('/login/', async (req, res) => {

    console.log("login request received");
    let { username, password } = req.body;
    let result = await loginUser(username, password);
    if(result.success){
        res.status(200);
        req.session.username = username;
        res.send("Successfully logged in the user");
    } else{
        res.status(400);
    }
});

app.post('/register/', async (req, res) => {
    console.log("register request received");
    let { username, password } = req.body;

    let result = await registerUser(username, password);
    if(result.success){

        req.session.username = username;
        res.status(200).send("Sucessfully created the user");
    } else{
        res.status(409).send("Username already taken");
    }
});

app.get('/profile/', (req, res) => {
  if (!req.session.username) {
    return res.status(401).send('Not logged in');
  }

  res.send(`Welcome, ${req.session.username}`);
});


app.get('/user/hmdcrml/:product', async function (req, res) {
    res.status(200);
    res.send(formatEventDetails(await eventDetails(req.params.eventID)));
})

app.put('/user/hmdcrml/:product', async function (req, res) {
    res.status(200);
    res.send(formatEventDetails(await eventDetails(req.params.eventID)));
})

app.delete('/user/hmdcrml/:product', async function (req, res) {
    res.status(200);
    res.send(formatEventDetails(await eventDetails(req.params.eventID)));
})

app.listen(3000, () => {
    console.log("Server now listening on http://localhost:3000/");
});


