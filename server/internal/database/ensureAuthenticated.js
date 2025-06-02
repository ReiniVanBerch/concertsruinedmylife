function ensureAuthenticated(req, res, next) {
  if (req.session.username) {
    return next(req, res); // user is logged in, continue to route
  }else{
    res.redirect(302, '/auth.html');
  }
}

module.exports = ensureAuthenticated;