require('dotenv').config();

function ensureAdmin(req, res, next) {
    console.log(process.env.ADMIN_KEY);
    console.log(req.session.admin_key);
    if(process.env.ADMIN_KEY == req.session.admin_key){
        next(req,res);
    } else {
        res.status(401).send("You shall feal this sword, foul white whale !!!");
    }
}

module.exports = ensureAdmin;