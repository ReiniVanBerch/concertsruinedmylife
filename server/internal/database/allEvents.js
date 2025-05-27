const db = require('./databaseConnector.js');

async function allEvents(){

    if (!req.session.username) {
        return res.status(401).send('Not logged in');
    }

    const getEvents = db.prepare('SELECT events FROM user WHERE username = ?');
    const events = await getPassword.get(username);




    if (events) {
        res.status(200).send({success:true, message: events})
    }
    else{
        res.status(200).send({success:true, message: "No Events found!"});
    }
}

module.exports = allEvents;