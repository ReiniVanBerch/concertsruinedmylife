const db = require('../databaseConnector.js');

async function allCostpoints(req, res){

    const getCostpoints  = db.prepare('SELECT * FROM costpoints WHERE username = ?');
    const costpoints = await getCostpoints.all(req.session.username);


    if (costpoints.length > 0) {
        res.status(200).send(costpoints);
    }
    else{
        console.log("empty");

        res.status(204).send({message: "No Costpoints found!"});
    }
}

module.exports = allCostpoints;