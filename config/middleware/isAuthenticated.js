

module.exports = function(req, res, next) {
    if (req.user) {
      return next();
    }
  
    console.log("No user detected.");
    return res.redirect("/");
  };
  