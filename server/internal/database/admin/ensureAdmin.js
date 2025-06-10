require('dotenv').config();

function ensureAdmin(req, res, next) {
    if(process.env.ADMIN_KEY == req.session.admin_key){
        next(req,res);
    } else {
        res.status(401).send({message:"You shall feal this harpoon, white whale !!!"});
    }
}

module.exports = ensureAdmin;