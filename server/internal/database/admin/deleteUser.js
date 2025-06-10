const db = require('../databaseConnector.js');

const { forEach } = require('async');


async function deleteUser(req, res){

    let username = req.params.username;



    // Ensure they are strings (defensive programming)
    username = typeof username === 'string' ? username : '';


    db.prepare('DELETE FROM events WHERE username = ?').run(username);
    db.prepare('DELETE FROM costpoints WHERE username = ?').run(username);
    const delUser = db.prepare('DELETE FROM users WHERE username = ?').run(username);

    if (delUser.changes > 0) {
        res.status(200).send({message:'Deleted User'});
    } else {
        res.status(404).send({message:"User not Found"});
    }

    
}

module.exports = deleteUser;