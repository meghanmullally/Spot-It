var db = require("../models");
var path = require("path");

var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function (app) {
  // Each of the below routes just handles the HTML page that the user gets sent to.
  // index route loads view.html
<<<<<<< HEAD
  //app.get("/", isAuthenticated, function(req, res) {
  //  res.sendFile(path.join(__dirname, "../public/blog.html"));
  //});

  app.get("/", function(req, res) {
    res.status(200).render("index1");
=======

  app.get("/", isAuthenticated, function (req, res) {
    res.sendFile(path.join(__dirname, "../public/blog.html"));

>>>>>>> 9c29c0456e667a319758711f8e773e5d7bce953c
  });

  app.get("/cms", isAuthenticated, function (req, res) {
    res.sendFile(path.join(__dirname, "../public/cms"));
  });

  // blog route loads blog.html
  app.get("/blog", isAuthenticated, function (req, res) {
    res.sendFile(path.join(__dirname, "../public/blog.html"));
  });

  app.get("/forums", function (req, res) {
    res.render('forums');
  })

  app.get("/forums/:name", function (req, res) {
    db.Forum.findOne({
      where: {
        name: req.params.name
      },
      include:[db.Post]
    }).then(function (dbForum) {
      console.log(dbForum.Posts)
      // res.json(dbForum);
      res.render("forum-page", { forum_data: dbForum });
    });
  })
};
