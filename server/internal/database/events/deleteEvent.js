const db = require('../databaseConnector.js');

async function deleteEvent(req, res){

    if (!req.session.username) {
        return res.status(401).send({message:'Not logged in'});
    }
    else{

        const eventId = parseInt(req.params.event, 10);
        const deleteEvent = db.prepare('DELETE FROM events WHERE username = ? AND id = ?');
        const result = deleteEvent.run(req.session.username, eventId);
        const deleteCostpoints = db.prepare('DELETE FROM costpoints WHERE username = ? AND eventID = ?');
        deleteCostpoints.run(req.session.username, eventId);

        if (result.changes > 0) {
            console.log("success");
            res.status(200).send({message: "Event deleted successfully." });
        } else {
            console.log("failure");
            res.status(404).send({message: "Event not found or unauthorized." });
        }
    }
}

module.exports = deleteEvent;