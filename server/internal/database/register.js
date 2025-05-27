const bcrypt = require('bcrypt');
const db = require('./databaseConnector.js');


async function registerUser(username, password){
    console.log("registerUser request received");

    // Ensure they are strings (defensive programming)
    username = typeof username === 'string' ? username : '';
    password = typeof password === 'string' ? password : '';

    const getUser = db.prepare('SELECT * FROM user WHERE username = ?');
    const user = getUser.get(username);

    if (!user) {
        const hashed = await bcrypt.hash(password, 8);
        const insertUser = db.prepare('INSERT INTO user (username, password) VALUES (?, ?)');

        insertUser.run(username, hashed);

        return { success: true, message: 'User registered' };
    } else {
        return { success: false, message: 'Username already taken' };
    }
}

module.exports = registerUser;