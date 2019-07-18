var express = require("express");

var router = express.Router();

var SpotifyWebApi = require('spotify-web-api-node');

scopes = ['user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public'];

require('dotenv').config();

// Spotify IDs

// client id
var spotifyApi = new SpotifyWebApi({
  client_id: process.env.CLIENT_ID,
  // secret id
  client_secret:  process.env.CLIENT_SECRET,
  // redirect uri
  redirect_uri: process.env.REDIRECT_URI
  });

  /* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Spot-it' });
});

router.get('/login', (req,res) => {
  var html = spotifyApi.createAuthorizeURL(scopes)
  console.log(html)
  res.send(html+"&show_dialog=true")  
})

router.get('/callback', async (req,res) => {
  const { code } = req.query;
  console.log(code)
  try {
    var data = await spotifyApi.authorizationCodeGrant(code)
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    res.redirect('http://localhost:3000/callback');
  } catch(err) {
    res.redirect('/#/error/invalid token');
  }
});

router.get('/userinfo', async (req,res) => {
    try {
      var result = await spotifyApi.getMe();
      console.log(result.body);
      res.status(200).send(result.body)
    } catch (err) {
      res.status(400).send(err)
    }
});

router.get('/playlists', async (req,res) => {
  try {
    var result = await spotifyApi.getUserPlaylists();
    console.log(result.body);
    res.status(200).send(result.body);
  } catch (err) {
    res.status(400).send(err)
  }

});
