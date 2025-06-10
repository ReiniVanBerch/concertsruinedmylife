const db = require('../databaseConnector.js');

async function getEvent(req, res){
    let username = req.session.username;
    let id = req.params.event;

    if (!req.session.username) {
        return res.status(401).send({message:'Not logged in'});
    }
    else{
        const getCostpoints = db.prepare('SELECT * FROM costpoints WHERE username = ? AND id = ?');
        const costpoints = await getEvents.get(username, id);

        if (costpoints) {
            res.status(200).send(costpoints);
        }
        else{
            res.status(200).send({message: "No Costpoints found!"});
        }
    }
}

module.exports = getEvent;