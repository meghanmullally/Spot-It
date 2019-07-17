var db = require("../models");
var path = require("path");

var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app) {
  // Each of the below routes just handles the HTML page that the user gets sent to.
  // index route loads view.html
  app.get("/", isAuthenticated, function(req, res) {
    res.sendFile(path.join(__dirname, "../public/blog.html"));
  });

  app.get("/cms", isAuthenticated, function(req, res) {
    res.sendFile(path.join(__dirname, "../public/cms.html"));
  });

  // blog route loads blog.html
  app.get("/blog", isAuthenticated, function(req, res) {
    res.sendFile(path.join(__dirname, "../public/blog.html"));
  });

  app.get("/forums", function(req,res){
    res.render('forums')
  })
};
