var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var db = require("../models");

passport.use("local.login", new LocalStrategy({
        usernameField: "user_name",
        passwordField: "password",
        passReqToCallback: true
    },
    function (req, userName, password, done) {
        db.User.findOne({
                where: {
                    userName: userName
                }
            })
            .then(function (user, err) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, req.flash("message", "Incorrect user name."));
                }
                else if (!user.isPasswordValid(password)) {
                    return done(null, false, req.flash("message", "Incorrect password"));
                }

                return done(null, user, req.flash("success", "Welcome!"));
            })
            .catch(function(err) {
                console.log(err);
                done(err)
            });
    }
));

passport.use("local.signup", new LocalStrategy({
        usernameField: "user_name",
        passwordField: "password",
        passReqToCallback: true
    },
    function (req, userName, password, done) {

        db.User.findOrCreate(
            {
                where: {
                    userName: req.body.user_name
                },
                defaults: {
                    userName: req.body.user_name,
                    firstName: req.body.first_name,
                    lastName: req.body.last_name,
                    email: req.body.email,
                    password: req.body.password
                }
            })
        .then(function (users, created) {
            if (!users[0]) {
                return done(null, false, req.flash("message", "Cannot find or create user."));
            }

            return done(null, users[0], req.flash("success", "Welcome!"));
        })
        .catch(function(err) {
            console.log(err);
            done(err)
        });
    }

));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

module.exports = passport;