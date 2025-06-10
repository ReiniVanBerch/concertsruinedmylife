const db = require('../databaseConnector.js');

async function patchEvent(req, res){

    if (!req.session.username) {
        return res.status(401).send({message:'Not logged in'});
    }
    else{
        let uname = req.session.username;
        let id = req.body.eventID;
        let event = req.body.event;

        const events = db.prepare('UPDATE events SET name = ? WHERE username = ? AND id = ?').run(event, uname, id);

        if(events.changes >0){
            res.status(200).send({message:'Event added'});
        } else{
            res.status(400).send({message:'Event not found'});
        }

    }
}

module.exports = patchEvent;