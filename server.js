require("dotenv").config();
var path = require('path');
var express = require("express");
var exphbs = require("express-handlebars");
var path = require('path'); 

var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var validator = require('express-validator');
var passport = require("./config/passport");
const flash = require('connect-flash');


var db = require("./models");

var app = express();
var PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000
  }
}))

app.use(session({
  secret: 'spotitsecret',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static("public"));

app.use(flash());
// Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());


// Handlebars

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials')
    // extname: '.hbs'
    //helpers: require('./lib/handlebars')
  })
);
app.set("view engine", "handlebars");

// Global variables
app.use((req, res, next) => {
  app.locals.message = req.flash('message');
  app.locals.success = req.flash('success');
  app.locals.user = req.user;
  next();
});



// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     maxAge: 60000
//   }
// }))

// app.use(express.static("public"));


// Routes
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);
require("./routes/spotifyRoutes")(app);


// require("./routes/htmlRoutes")(app);

var syncOptions = {
  force: false
};

  syncOptions.force = false;


// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function() {
  app.listen(PORT, function() {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});




module.exports = app;


