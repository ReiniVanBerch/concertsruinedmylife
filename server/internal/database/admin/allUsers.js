const db = require('../databaseConnector.js');

function allUsers(req, res){

    let getUsers = db.prepare("SELECT * FROM users");
    let users = getUsers.all();

    res.status(200).send(users);
}

module.exports = allUsers;