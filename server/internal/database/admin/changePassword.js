const bcrypt = require('bcrypt');
const db = require('../databaseConnector.js');

async function changePassword(req, res){
    
    let username = req.body.username;
    let password = req.body.password;
    const hashed = await bcrypt.hash(password, 8);

    let effects = db.prepare("UPDATE users SET password = ? WHERE username = ?").run(hashed, username);

    if (effects.changes > 0) {
        res.status(200).send({message:'Changed Password'});
    } else {
        res.status(404).send({message:"User not Found"});
    }


}

module.exports = changePassword;