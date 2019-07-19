$(document).ready(function() {
  // Gets an optional query string from our url (i.e. ?post_id=23)
  var url = window.location.search;
  var forumId;
  // Sets a flag for whether or not we're updating a post to be false initially
  var updating = false;

  // If we have this section in our url, we pull out the post id from the url
  // In localhost:8080/cms?post_id=1, postId is 1
  if (url.indexOf("?forum_id=") !== -1) {
    forumId = url.split("=")[1];
    getFormData(forumId);
  }

  // Getting jQuery references to the post body, title, form, and category select
  var descriptionInput = $("#description");
  var nameInput = $("#name");
  var cmsForm = $("#cms");
  // Giving the postCategorySelect a default value
  // Adding an event listener for when the form is submitted
  $(cmsForm).on("submit", function handleFormSubmit(event) {
    event.preventDefault();
    // Wont submit the post if we are missing a body or a title
    if (!nameInput.val().trim() || !descriptionInput.val().trim()) {
      return;
    }
    // Constructing a newPost object to hand to the database
    var newForum = {
      name: nameInput.val().trim(),
      description: descriptionInput.val().trim(),
    };

    console.log(newForum);

    // If we're updating a post run updatePost to update a post
    // Otherwise run submitPost to create a whole new post
    if (updating) {
      newForum.id = forumId;
      updateForum(newForum);
    }
    else {
      submitForum(newForum);
    }
  });

  // Submits a new post and brings user to blog page upon completion
  function submitForum(Forum) {
    $.post("/api/forums/", Forum, function() {
      window.location.href = "/api/forums/";
    });
  }

  // Gets post data for a post if we're editing
  function getForumData(id) {
    $.get("/api/forums/" + id, function(data) {
      if (data) {
        // If this post exists, prefill our cms forms with its data
        nameInput.val(data.name);
        descriptionInput.val(data.description);
        // If we have a post with this id, set a flag for us to know to update the post
        // when we hit submit
        updating = true;
      }
    });
  }

  // Update a given post, bring user to the blog page when done
  function updateForum(forum) {
    $.ajax({
      method: "PUT",
      url: "/api/forums",
      data: forum
    })
      .then(function() {
        window.location.href = "/api/forums";
      });
  }
});
