const db = require('../databaseConnector.js');

async function getEvent(req, res){
    let username = req.session.username;
    let id = req.params.event;

    if (!req.session.username) {
        return res.status(401).send('Not logged in');
    }
    else{
        const getEvents = db.prepare('SELECT * FROM event WHERE username = ? AND eventID = ?');
        const events = await getEvents.get(username, id);

        if (events) {
            res.status(200).send(events);
        }
        else{
            res.status(200).send({success:true, message: "No Events found!"});
        }
    }
}

module.exports = getEvent;