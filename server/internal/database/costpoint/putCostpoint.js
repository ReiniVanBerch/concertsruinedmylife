const db = require('../databaseConnector.js');

async function putCostpoint(req, res){

    if (!req.session.username) {
        return res.status(401).send('Not logged in');
    }
    else{
        let uname = req.session.username;
        let event = req.body.eventID;
        let text = req.body.text;
        let cost = req.body.cost;
        
        if(!cost) cost = 0;

        const events = db.prepare('INSERT INTO costpoints (username, eventID, text, cost) VALUES (?, ?, ?, ?)').run(uname, event, text, cost);
    }
}

module.exports = putCostpoint;