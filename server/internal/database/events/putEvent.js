const db = require('../databaseConnector.js');

async function putEvent(req, res){
    console.log("I am in");
    let uname = req.session.username;
    let event = req.body.event;
    console.log(req.body.event);

    const events = db.prepare('INSERT INTO events (username, name) VALUES (?, ?)').run(uname, event);
    //res.status(200).send("Created");
}

module.exports = putEvent;