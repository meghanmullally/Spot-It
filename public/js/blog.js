
    $(document).ready(function() {
      $(".form-group").hide();
      $("#formButton").click(function() {
      $(".form-group").toggle();
    });
  $("#submit-button").on("click", function(event){
      console.log("button clicked");
      event.preventDefault();
      var title = $("#title").val();
      var body = $("#body").val();
      var category = $("#category").val();
      var forumid = $("#forumid").val();
      console.log(forumid);
      
      $.post("/api/posts", {
          title : title,
          body : body,
          category : category,
          ForumId : forumid
          // UserId: UserId
      }).then(function(res){
          console.log(res);
          window.location.reload();
      })
  // });

  });
  
  });
  