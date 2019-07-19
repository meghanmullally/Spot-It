var db = require("../models");
var passport = require("../config/passport");

var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function (app) {
    app.get("/signup", function (req, res) {
        if (req.user) {
            res.redirect("/");
            return;
        }

        res.status(200).render("auth/signup");
    });

    app.post("/signup", function (req, res) {
        if (req.user) {
            res.redirect("/");
            return;
        }

        req.check("first_name", "First Name is Required").notEmpty();
        req.check("last_name", "Last Name is Required").notEmpty();
        req.check("user_name", "User Name is Required").notEmpty();
        req.check("email", "Email is Required").notEmpty();
        req.check("email", "Email is not valid.").isEmail();
        req.check("password", "Password is Required").notEmpty();
        req.check("password", "Password should have at least 5 characters.").isLength({ min: 5 })

        var errors = req.validationErrors();
        
        if (errors.length > 0) {
            req.flash("message", errors[0].msg);
            res.redirect("/signup");
            return;
        }

        db.User.create({
                userName: req.body.user_name,
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                email: req.body.email,
                password: req.body.password
            })
            .then(function () {
                res.redirect(302, "/login"); // temporary redirect
            })
            .catch(function (err) {
                console.log(err);
                res.render(401); // unauthorized
            });
    });

    app.get("/login", function (req, res) {
        if (req.user) {
            res.redirect("/");
            return;
        }

        res.status(200).render("auth/login");
    });

    app.post("/login", function(req, res, next) {
        if (req.user) {
            res.redirect("/");
            return;
        }

        req.check("user_name", "User Name is Required").notEmpty();
        req.check("password", "Password is Required").notEmpty();
        
        var errors = req.validationErrors();
        
        if (errors.length > 0) {
            req.flash("message", errors[0].msg);
            res.redirect("/login");
            return;
        }

        passport.authenticate("local", function(err, user, info) {
            if (err) {
                console.log("Error: ", err);
                return next(err);
            }
            if (!user) {
                return res.redirect("/login");
            }
            console.log("User: ", user);
            console.log("Info: ", info);

            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }

                return res.redirect("/blog");
              });

        })(req, res, next);

    });

    app.get("/profile", isAuthenticated, function (req, res) {
        var user = {
            id: req.user.id,
            userName: req.user.userName,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email
        };

        res.status(200).render("profile", {
            user: user
        });
    });

    app.post("/profile", isAuthenticated, function (req, res) {
        var userId = req.user.id;

        var newInfo = {
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            email: req.body.email,
            password: req.body.password
        };
        if (newInfo.password.length === 0) {
            delete newInfo.password;
        }

        db.User.update(newInfo, {
                where: {
                    id: userId
                },
                individualHooks: true
            })
            .then(function (rowsUpdated) {

                req.user.firstName=newInfo.firstName;
                req.user.lastName=newInfo.lastName;
                req.user.email=newInfo.email;

                res.redirect(302, "/profile");
            })
            .catch(function (err) {
                console.log(err);
            });
    });

    app.get("/editprofile", isAuthenticated, function (req, res) {
        var user = {
            id: req.user.id,
            userName: req.user.userName,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email
        };

        res.status(200).render("editprofile", {
            user: user
        });
    });

    app.get("/changepassword", isAuthenticated, function (req, res) {
        res.status(200).render("changePassword");
    });

    app.post("/changepassword", isAuthenticated, function (req, res) {
        var userId = req.user.id;
        var oldPassword = req.body.oPassword;
        var newPassword = req.body.nPassword;

        db.User.findByPk(userId).then(function (user) {
            if (!user.isPasswordValid(oldPassword)) {
                req.logout();
                req.redirect(302, "/login");
                return;
            }

            return;
            db.User.update({
                    password: newPassword
                }, {
                    where: {
                        id: user.id
                    }
                })
                .then(function () {
                    res.redirect(302, "/changepassword"); // temporary redirect
                })
                .catch(function (err) {
                    res.render(401); // unauthorized
                });
        });
    });

    app.get("/logout", function (req, res) {
        req.logout();
        res.redirect("/");
    });
};