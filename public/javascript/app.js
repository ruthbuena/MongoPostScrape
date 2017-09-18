$(document).ready(function(){

  $(".button-collapse").sideNav();

  $('.add-comment-button').on('click', function(){

    var articleId = $(this).data("id");
    var baseURL = window.location.origin;

    var frmName = "form-add-" + articleId;
    var frm = $('#' + frmName);


    //delete Comment
    $.ajax({
      url: baseURL + '/add/comment/' + articleId,
      type: 'POST',
      data: frm.serialize(),
    })
    .done(function() {
      location.reload();
    });
    return false;
  });



  $('.delete-comment-button').on('click', function(){
    var commentId = $(this).data("id");
    var baseURL = window.location.origin;

    //delete Comment
    $.ajax({
      url: baseURL + '/remove/comment/' + commentId,
      type: 'POST',
    })
    .done(function() {
      location.reload();
    });

    return false;
  });
});
