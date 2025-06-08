const db = require('../databaseConnector.js');

async function allUsers(req, res){

    req.session.ADMIN_KEY
    db.prepare("SELECT * FROM users");
    let users = db.all();

    users.forEach(user => {
        let id = user.id;
        let article = document.createElement('article');
        article.id = id;
        let button = document.createElement('button');
        button.addEventListener('click', function (id) {
        })
    });
}

module.export = allUsers;