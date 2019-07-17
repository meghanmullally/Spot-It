var db = require("../models");
var passport = require("../config/passport");

var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function (app) {

    app.get("/signup",
        function (req, res) {
            if (req.user) {
                res.redirect("/");
            }

            res.status(200).render("signup");
        }
    );

    app.post("/signup", 
        function (req, res) {
            db.User.create({
                userName: req.body.user_name,
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                email: req.body.email,
                password: req.body.password
            })
            .then(function () {
                res.redirect(302, "/login");  // temporary redirect
            })
            .catch(function (err) {
                console.log(err);
                res.render(401); // unauthorized
            });
        }
    );

    app.get("/login",
        function (req, res) {
            if (req.user) {
                res.redirect("/");
            }

            res.status(200).render("login");
        }
    );

    app.post("/login",
        passport.authenticate("local"),
        function (req, res) {
            res.redirect(302, "/");
        }
    );

    app.get("/userprofile",
        isAuthenticated,
        function (req, res) {
            var user = {
                id: req.user.id,
                userName: req.user.userName,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email
            };

            res.status(200).render("userprofile", { user: user });
        }
    );

    app.get("/changepassword",
        isAuthenticated,
        function(req, res) {
            res.status(200).render("changePassword");
        });

    app.post("/changepassword",
        isAuthenticated,
        function(req, res) {
            var userId = req.user.id;
            var oldPassword = req.body.oPassword;
            var newPassword = req.body.nPassword;

            db.User.findByPk(userId)
            .then(function(user) {
                if (!user.isPasswordValid(oldPassword)) {
                    req.logout();
                    req.redirect(302, "/login");
                    return;
                }
    
                return;
                db.User.update(
                    {
                        password: newPassword
                    },
                    {
                        where: {
                            id: user.id
                        }
                    }
                )
                .then(function () {
                    res.redirect(302, "/changepassword");  // temporary redirect
                })
                .catch(function (err) {
                    res.render(401); // unauthorized
                });
            })
        });

    app.get("/logout",
        function (req, res) {
            req.logout();
            res.redirect("/");
        }
    );

};