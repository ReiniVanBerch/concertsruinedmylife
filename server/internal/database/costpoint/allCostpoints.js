const db = require('../databaseConnector.js');

async function allEvents(req, res){

    const getCostpoints  = db.prepare('SELECT * FROM costpoints WHERE username = ?');
    const costpoints = await getCostpoints.all(req.session.username);

    if (events) {
        res.status(200).send(costpoints);
    }
    else{
        res.status(200).send({success:true, message: "No Costpoints found!"});
    }
}

module.exports = allEvents;