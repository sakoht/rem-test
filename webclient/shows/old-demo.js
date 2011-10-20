function (doc,req) {
    var s = '';
    s += '<h1>flinkt</h1>';
    s += '<ol>';
    s += '<li><a id="flinkt.org bookmarklet link" href="">flinkt</a>   <==========   drag this link onto your bookmarks bar!</li>';
    s += '<li>go to any web site (or stay right here to try it)</li>';
    s += '<li>click the bookmark to turn on the flinkt pen ...it appears on the right</li>';
    s += '<li>select any statement to highlight it</li>';
    s += '<li>click any highlighted statement to see options like email, digg, facebook, google+, and twitter (NOT IMPLEMENTED)</li>';
    s += '<li>turn the pen on and off whenever you want by clicking on the image on the right (NOT IMPEMENTED)</li>';
    s += '<li>when you come back to the site, turn on the pen again to see your previous highlights (NOT IMPLEMENTED)</li>';
    s += '<li>click on the green arrow to see all of your highlights, see a capture of the page, and send them around (NOT IMPLEMENTED)</li>';
    s += '</ol>';

    return '<script type="text/javascript" src="/_utils/script/jquery.js"></script> <script type="text/javascript" src="/_utils/script/jquery.couch.js"></script> <script type="text/javascript" src="/flinktdb/_design/webclient/js/decorate-bookmarklet-link.js"></script>' + s;
}
