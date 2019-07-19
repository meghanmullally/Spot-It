var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var db = require("../models");

passport.use("local", new LocalStrategy({
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

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

module.exports = passport;