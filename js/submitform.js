var submitform = $('#submitform');

submitform.on('submit', function (evt) {
  // stop page from refreshing on submit
  evt.preventDefault();
  $.ajax({
    type: "POST",
    data: new FormData(this),
    processData: false,
    contentType: false,
    success: function (data) {
      var uploadSuccess =
        "<div class='success'><span class='closebtn' onclick='this.parentElement.style.display=\"none\";'>&times;</span><strong>Success!</strong> Thank you for your message, I\'ll get back to you as soon as possible.</div>";
      $('#submitform').find('.messages').html(uploadSuccess);
    },
    error: function (err) {
      var uploadFailed =
        "<div class='failed'><span class='closebtn' onclick='this.parentElement.style.display=\"none\";'>&times;</span><strong>Error.</strong> Your message was not sent, please make sure all fields are correct. For other issues please <a class='squigglyURL--main' href='mailto:robert@nhg.design'>send me an e-mail</a>.</div>";
      $('#submitform').find('.messages').html(uploadFailed);
    }
  });
});