const db = require('../databaseConnector.js');

async function putEvent(req, res){

    if (!req.session.username) {
        return res.status(401).send({message:'Not logged in'});
    }
    else{
        let uname = req.session.username;
        let event = req.body.event;

        const events = db.prepare('INSERT INTO events (username, name) VALUES (?, ?)').run(uname, event);

        res.status(200).send({message:'Event added'});
    }
}

module.exports = putEvent;