const db = require('../databaseConnector.js');

async function deleteEvent(req, res){


    const eventId = parseInt(req.params.event, 10);
    console.log(typeof eventId);
    const deleteEvent = db.prepare('DELETE FROM events WHERE username = ? AND id = ?');
    const result = deleteEvent.run(req.session.username, eventId);

    if (result.changes > 0) {
        console.log("success");
        res.status(200).send({ success: true, message: "Event deleted successfully." });
    } else {
        console.log("failure");
        res.status(404).send({ success: false, message: "Event not found or unauthorized." });
    }

}

module.exports = deleteEvent;