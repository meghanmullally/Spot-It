$(document).ready(function () {


  $.ajax({
    url: "/api/playlists",
    type: 'GET',
  }).then(function (data) {

    console.log(data, "HELLO");

    // creating a new iframe for each playlist widget 
    //get url from data and then set the attr => src equal to url 

    for (var i = 0; i < data.length; i++) {
      var newIframe = $("<iframe>").attr({
        'src': "https://embed.spotify.com/?uri=" + data[i],
        "frameborder": '0',
        "allowtransparency": 'true'
      });

      console.log(data[i])
      // console.log("are we here?")
      //  newIframe.append($('.embed-container'));
      $(".embed-container").append(newIframe);
      console.log(newIframe)
    }

  });

});