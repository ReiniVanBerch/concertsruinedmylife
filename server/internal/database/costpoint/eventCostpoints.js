const db = require('../databaseConnector.js');

async function allEvents(req, res){

    let username = req.session.username;
    let id = req.params.event;

    
    const getCostpoints  = db.prepare({message:'SELECT * FROM costpoints WHERE username = ? AND eventID = ?'});
    const costpoints = await getCostpoints.all(req.session.username, res);

    if (events) {
        res.status(200).send(costpoints);
    }
    else{
        res.status(200).send({message: "No Costpoints found!"});
    }
}

module.exports = allEvents;