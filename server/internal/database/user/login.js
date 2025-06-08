const db = require('../databaseConnector.js');
const bcrypt = require('bcrypt');

async function login(req, res){
    let { username, password } = req.body;

    username = typeof username === 'string' ? username : '';
    password = typeof password === 'string' ? password : '';

    try{
        const getPassword = db.prepare('SELECT password FROM user WHERE username = ?');
        const user = await getPassword.get(username);




        if (user) {
            const passwordHash = user.password;
            const result = await bcrypt.compare(password, passwordHash);

            if(result){
                req.session.username = username;
                res.redirect(302, '/profile');
            }
            else{
                res.status(401).send({ success: false, message: 'Incorrect Username or Password' });
            }
        }
        else{
            res.status(401).send({ success: false, message: 'Incorrect Username or Password' });
        }



    } catch{
        res.status(401).send({ success: false, message: 'Incorrect Username or Password'});
    }
}

module.exports = login;