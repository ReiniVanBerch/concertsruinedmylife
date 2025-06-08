const db = require('../databaseConnector.js');

async function deleteCostpoint(req, res){

    if (!req.session.username) {
        return res.status(401).send('Not logged in');
    }
    else{

        const costpointID = parseInt(req.params.costpoint, 10);
        const deleteCostpoint = db.prepare('DELETE FROM costpoints WHERE username = ? AND id = ?');
        const result = deleteCostpoint.run(req.session.username, costpointID);


        if (result.changes > 0) {
            console.log("success");
            res.status(200).send({ success: true, message: "Costpoint deleted successfully." });
        } else {
            console.log("failure");
            res.status(404).send({ success: false, message: "Costpoint not found or unauthorized." });
        }
    }
}

module.exports = deleteCostpoint;