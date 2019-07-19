require("dotenv").config();
var path = require('path');
var express = require("express");
var exphbs = require("express-handlebars");

// dependencies for spotify 
var SpotifyWebApi = require('spotify-web-api-node');
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var session = require('express-session')

var validator = require('express-validator');
var passport = require("./config/passport");
const flash = require('connect-flash');


var db = require("./models");

var app = express();
var PORT = process.env.PORT || 3000;


// Spotify IDs

// client id

var client_id = process.env.CLIENT_ID;
// secret id
var client_secret = process.env.CLIENT_SECRET;
// redirect uri
var redirect_uri = process.env.REDIRECT_URI;


// Middleware
app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());

app.use(session({

  secret:'keyboard cat',
  resave:false,
  saveUninitialized:true,
  cookie:{maxAge:60000}
}))
app.use(express.static("public"));

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
require("./routes/apiRoutes")(app);

// require("./routes/htmlRoutes")(app);

var syncOptions = {
  force: false
};

// If running a test, set syncOptions.force to true
// clearing the database
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// SPOTIFY LOGIN IN AUTHORIZATION CODE 

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

// var app = express();

app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

app.get('/login', function (req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  //  application requests authorization
  var scope = 'user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
      state: state
    }));
// console.log("SUP", res.data)

});

app.get('/readsessions',function(req,res){
  if(req.session.token){
    res.json({
      userId:req.session.userId,
      token:req.session.token

    })
  }
  else {
    res.json('not logged in')
  }
})

app.get('/callback', function (req, res) {
  console.log('got here');
  //  application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        client_id:client_id,
        client_secret:client_secret,
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      json: true
    };

    request.post(authOptions, function (error, response, body) {
      console.log(response)
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;
          req.session.token = access_token;
          console.log(access_token);
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/profile/?' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token Here1'
          }));
      }
     
    });
  }
});

app.get('/refresh_token', function (req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };


  // grabbing access token and putting it on the body 
  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;

      res.send({
        'access_token': access_token
      });
      
    }
  });
});

console.log('Listening on 3000');

// SPOTIFY API FOR PLAYLIST

app.get('/playlists',function(req,res){
  
  request.get({
    url:`https://api.spotify.com/v1/users/${req.session.userId}/playlists`,
    headers:{
      'Authorization': 'Bearer ' +req.session.token,
    }
  },function(err,response,body){
    let jsonBody = JSON.parse(body);
    res.send(jsonBody);
  })
})

app.post('/playlists', function (req, res) {
  
  var playlist_url = 'https://api.spotify.com/v1/users/' + req.session.userId + '/playlists';
  var authOptions1 = {
    url: playlist_url,
    body: JSON.stringify({
      name: 'name',
      public: false
    }),
    dataType: 'json',
    headers: {
      'Authorization': 'Bearer ' + req.session.token,
      'Content-Type': 'application/json',
    }
    };
  request.post(authOptions1, function (err, response, body) {
    // console.log(body);
    
  })
});

app.get('/profile',(req,res)=>{
  request.get({
    url:"https://api.spotify.com/v1/me",
    headers:{
      'Authorization': 'Bearer ' +req.session.token,
    }
  },function(err,response,body){
    let jsonBody = JSON.parse(body);
    req.session.userId = jsonBody.id;
    res.send(jsonBody);
  })
})

app.get('/',(req,res)=>{
  res.json(req.query.access_token)
})


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

