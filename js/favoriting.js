var path = window.location.href;
var page = document.getElementsByClassName('post-title')[0].innerHTML;
var href = '<a class="page--listitem" href="' + path +
  '"><svg class="listitem--icon icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" width="24px"><path d="M16.5,3C13.605,3,12,5.09,12,5.09S10.395,3,7.5,3C4.462,3,2,5.462,2,8.5c0,4.171,4.912,8.213,6.281,9.49 C9.858,19.46,12,21.35,12,21.35s2.142-1.89,3.719-3.36C17.088,16.713,22,12.671,22,8.5C22,5.462,19.538,3,16.5,3z"/></svg>' +
  page + '</a>'
/* Check for each a tag if already added to localStorage
 * .contents[0].nodevalue returns value of tag a
 */
$('.favorites input').each(function (e) {
  if (localStorage.getItem(href)) {
    $(this).removeClass("favorite");
    $(this).addClass("unfavorite");
  } else {
    $(this).removeClass("unfavorite");
    $(this).addClass("favorite");
  }
});
//create click event and check if nodeValue is already added or not and set text accordingly
$('.favorites input').click(function (e) {
  if (localStorage.getItem(href)) {
    localStorage.removeItem(href);
    $(this).removeClass("unfavorite");
    $(this).addClass("favorite");
  } else {
    localStorage.setItem(href, 'favorite');
    $(this).removeClass("favorite");
    $(this).addClass("unfavorite");
  }
});