if (!getCookie("update-notice-dismissed")) {
    $('#update-notice').slideDown('slow');

    console.log(getCookie("update-notice-dismissed"));
}

$('#dismiss-update-notice').on('click', function(e) {
    e.preventDefault();
    $('#update-notice').slideUp('slow');
    setCookie("update-notice-dismissed", "true", 5);
});

//#region - Private Functions

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return false;
}

//#endregion - Private Functions