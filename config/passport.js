var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var db = require("../models");

passport.use("local", new LocalStrategy({
        usernameField: "user_name",
        passwordField: "password"
    },
    function (userName, password, done) {
        db.User.findOne({
            where: {
                userName: userName
            }
        })
        .then(function (user) {
            if (!user) {
                return done(null, false, {
                    message: "Incorrect email."
                });
            }
            else if (!user.isPasswordValid(password)) {
                return done(null, false, {
                    message: "Incorrect password."
                });
            }

            return done(null, user);
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