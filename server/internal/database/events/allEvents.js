const db = require('../databaseConnector.js');

async function allEvents(req, res){

    if (!req.session.username) {
        return res.status(401).send({message:'Not logged in'});
    }
    else{
        const getEvents = db.prepare('SELECT * FROM events WHERE username = ?');
        const events = await getEvents.all(req.session.username);

        if (events) {
            res.status(200).send(events)
        }
        else{
            res.status(200).send({message: "No Events found!"});
        }
    }


}

module.exports = allEvents;