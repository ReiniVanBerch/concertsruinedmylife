const db = require('../databaseConnector.js');

const { forEach } = require('async');


async function deleteUser(req, res){

    let username = req.params.username;


    console.log("deleteUser request received");

    // Ensure they are strings (defensive programming)
    username = typeof username === 'string' ? username : '';


    const deleteEvent = db.prepare('DELETE FROM events WHERE username = ?');
    const events = deleteEvent.run(username);
    const deleteCostpoints = db.prepare('DELETE FROM costpoints WHERE username = ?');
    const costpoints = deleteCostpoints.run(username);
    const delUser = db.prepare('DELETE FROM user WHERE username = ?');
    const user = delUser.all(username);

    res.status(200).send({message:'Deleted User'});
}

module.exports = deleteUser;