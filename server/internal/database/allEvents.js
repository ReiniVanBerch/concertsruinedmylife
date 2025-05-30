const db = require('./databaseConnector.js');

async function allEvents(req, res){

    if (!req.session.username) {
        return res.status(401).send('Not logged in');
    }
    else{
        const getEvents = db.prepare('SELECT * FROM event WHERE username = ?');
        const events = await getEvents.get(req.session.username);

        if (events) {
            res.status(200).send({success:true, message: events})
        }
        else{
            res.status(200).send({success:true, message: "No Events found!"});
        }
    }


}

module.exports = allEvents;