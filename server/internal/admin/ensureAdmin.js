function ensureAdmin(req, res, next) {
  if(process.env.ADMIN_KEY == req.params.admin){
      req.session.admin_key = req.params.admin;
      res.status(200).send("You got this monarch!");
  } else {
      res.status(401).send("You shall feal this sword, foul white whale !!!");
  }
}

module.exports = ensureAuthenticated;