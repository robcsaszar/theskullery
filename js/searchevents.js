$(document).ready(function () {
    $('#search-input').keyup('input', function () {
      if ($(this).val().length > 0) {
        $('#recipes').hide();
        $('#spinner').show();
        $('#spinner').delay(500).fadeOut(0);
        $('#results-container').hide();
        $('#results-container').delay(300).fadeIn(500);
        currentHeight = $('#search-container').outerHeight();
        $('.search').addClass('used').css('height', currentHeight);
        $(window).scrollTop($('#search').offset().top), 4000;
      } else {
        $('#recipes').show();
        $('#search-container').hide();
      }
    });
  });

  $('#search-input').focusin(function(e) {
        var container = $('#search-input'),
        scrollTo = $(e.target);

        container.animate({
            scrollTop: scrollTo.offset().top
        }, 300);    
});

if( /iphone|ipod|ipad|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(navigator.userAgent.toLowerCase()) ) {
    var $htmlOrBody = $('html, body'),
        scrollTopPadding = 8;
    $('#search-input').focus(function() {
        $htmlOrBody.scrollTop($('#search').offset().top), 4000;
      });
    }