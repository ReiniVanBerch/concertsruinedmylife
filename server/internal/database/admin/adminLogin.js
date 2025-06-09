require('dotenv').config();

function adminLogin (req, res) {
    if(process.env.ADMIN_KEY == req.params.admin){
        req.session.admin_key = req.params.admin;
        res.status(200).send(
            "<p>You now have admin priveledges for this session!<br>"+
            "To logout go to <a href='/logout'>this link</a> <br>" +
            "Else you might go <a href ='/admin.html'>here</a></p>");
    } else {
        res.status(401).send("You shall feal this sword, foul white whale !!!");
    }
}

module.exports = adminLogin;