const db = require('../databaseConnector.js');

function allUsers(req, res){

    let getUsers = db.prepare("SELECT * FROM users");
    let users = getUsers.all();

    if(users.length > 0){
        res.status(200).send(users);
    } else{
        res.status(200).send({message:"No Users found"});
    }
}

module.exports = allUsers;