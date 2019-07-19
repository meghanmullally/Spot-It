require("dotenv").config();
var path = require('path');
var express = require("express");
var exphbs = require("express-handlebars");
var session = require('express-session');
var validator = require('express-validator');
var passport = require("./config/passport");
const flash = require('connect-flash');

var db = require("./models");

var app = express();
var PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());
app.use(express.static("public"));

// Session
app.use(session({
  secret: 'spotitsecret',
  saveUninitialized: true,
  resave: true
}));

app.use(flash());
// Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());

// Handlebars
app.engine(
  "hbs",
  exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
    //helpers: require('./lib/handlebars')
  })
);
app.set("view engine", "hbs");

// Global variables
app.use((req, res, next) => {
  app.locals.message = req.flash('message');
  app.locals.success = req.flash('success');
  app.locals.user = req.user;
  next();
});

// Routes
require("./routes/userRoutes")(app);
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

var syncOptions = {
  force: false
};

// If running a test, set syncOptions.force to true
// clearing the database
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function () {
  app.listen(PORT, function () {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});


module.exports = app;