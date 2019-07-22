var express = require("express");
var path = require('path');

var request = require('request'); 
// "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var session = require('express-session')


// Spotify IDs

// client id
var client_id = process.env.CLIENT_ID;
// secret id
var client_secret = process.env.CLIENT_SECRET;
// redirect uri
var redirect_uri = process.env.REDIRECT_URI;



module.exports = function (app) {


  // app.use(session({
  //   secret: 'keyboard cat',
  //   resave: false,
  //   saveUninitialized: true,
  //   cookie: {
  //     maxAge: 60000
  //   }
  // }))

  // app.use(express.static("public"));


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


  // spotify log in authorization 
  // redirected to accounts.spotify.com/authorize? so the user is able to connect to their account 
  app.get('/spotify-login', function (req, res) {

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


  });

  app.get('/readsessions', function (req, res) {
    if (req.session.token) {
      res.json({
        userId: req.session.userId,
        token: req.session.token

      })
    } else {
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
          client_id: client_id,
          client_secret: client_secret,
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
          res.redirect('/home.html' 
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            })
            );
        }
         else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
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

  // grabbing user's playlist full list 
  app.get('/api/playlists', function (req, res) {

    request.get({
      url: `https://api.spotify.com/v1/users/${req.session.userId}/playlists`,
      headers: {
        'Authorization': 'Bearer ' + req.session.token,
      }
    }, function (err, response, body) {
      let jsonBody = JSON.parse(body);


      // empty array to grab spotify:playlist uri 
      var uriPlaylist = [];
      for (var i = 0; i < jsonBody.items.length; i++) {
        uriPlaylist.push(jsonBody.items[i].uri);
      }



      res.send(uriPlaylist);

    })

  })

  // creating playlist 
  app.post('/playlists', function (req, res) {

    //var playlist_url = 'https://api.spotify.com/v1/users/' + req.session.userId + '/playlists';
    var playlist_url = 'https://api.spotify.com/v1/users/1223543784/playlists';
    var authOptions1 = {
      url: playlist_url,
      body: JSON.stringify({
        name: '',
        description: '',
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


  app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "./public/spotify.html"));
    // res.sendFile(path.join(__dirname, "../public/spotify.html"));
  });

  // grabbing user profile info 
  app.get('/profile', (req, res) => {
    request.get({
      url: "https://api.spotify.com/v1/me",
      headers: {
        'Authorization': 'Bearer ' + req.session.token,
      }
    }, function (err, response, body) {
      let jsonBody = JSON.parse(body);
      req.session.userId = jsonBody.id;
      res.send(jsonBody);
    })
  })

  app.get('/', (req, res) => {
    res.json(req.query.access_token)
    //res.sendFile(path.join(__dirname, "../public/spotify.html"));
  })


}