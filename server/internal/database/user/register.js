const bcrypt = require('bcrypt');
const db = require('../databaseConnector.js');


async function register(req, res){
    let { username, password } = req.body;


    console.log("registerUser request received");

    // Ensure they are strings (defensive programming)
    username = typeof username === 'string' ? username : '';
    password = typeof password === 'string' ? password : '';

    const getUser = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = getUser.get(username);

    if (!user) {
        const hashed = await bcrypt.hash(password, 8);
        const insertUser = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');

        insertUser.run(username, hashed);

        req.session.username = username;
        res.redirect(302, '/profile');

    } else {
        res.status(409).send({ success: false, message: 'Username already taken' });
    }
}

module.exports = register;