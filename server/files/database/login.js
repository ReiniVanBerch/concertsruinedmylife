const db = require('./databaseConnector.js');
const bcrypt = require('bcrypt');


async function loginUser(username, password){

    // Ensure they are strings (defensive programming)
    username = typeof username === 'string' ? username : '';
    password = typeof password === 'string' ? password : '';

    const getPassword = db.prepare('SELECT password FROM user WHERE username = ?');
    const user = await getPassword.get(username);
    const passwordHash = user.password;


    if (passwordHash) {
        console.log(typeof password);
        console.log(typeof passwordHash);
        
        const result = await bcrypt.compare(password, passwordHash);
        if(result){
            return { success: true, message: 'User logged in' };
        }
        return { success: false, message: 'Incorrect Username or password' };
    } else {
        return { success: false, message: 'Incorrect Username or password' };
    }
}

module.exports = loginUser;