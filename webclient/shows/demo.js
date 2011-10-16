function (doc,req) {
    // !code vendor/Math.uuid.js
    var flinkt_id_str = Math.uuid();

    var bookmarklet_text = function () {
        var b = "javascript:(function(){";
        b += "  if(document.getElementById('flinkt.org bookmarklet') == null) {";
        b += "    s=document.createElement('script');";
        b += "    s.flinkt_init_bookmarklet_id = '" + flinkt_id_str + "';";
        b += "    s.flinkt_init_session_id = Date();";
        b += "    s.setAttribute('type','text/javascript');";
        b += "    s.setAttribute('charset','UTF-8');";
        b += "    s.setAttribute('src','http://www.flinkt.org/static/js/selector.js?id=" + flinkt_id_str + "&date=' + s.flinkt_init_session_id);";
        b += "    s.setAttribute('id','flinkt.org bookmarklet');";
        b += "    document.body.appendChild(s);";
        b += "  }";
        b += "})();";
        return(b);
    };

    var s = '';
    s += '<h1>flinkt</h1>';
    s += '<ol>';
    s += '<li><a href="' + bookmarklet_text() + '">flinkt (' + flinkt_id_str + ')</a>   <==========   drag this link onto your bookmarks bar!</li>';
    s += '<li>go to any web site (or stay right here to try it)</li>';
    s += '<li>click the bookmark to turn on the flinkt pen ...it appears on the right</li>';
    s += '<li>select any statement to highlight it</li>';
    s += '<li>click any highlighted statement to see options like email, digg, facebook, google+, and twitter (NOT IMPLEMENTED)</li>';
    s += '<li>turn the pen on and off whenever you want by clicking on the image on the right (NOT IMPEMENTED)</li>';
    s += '<li>when you come back to the site, turn on the pen again to see your previous highlights (NOT IMPLEMENTED)</li>';
    s += '<li>click on the green arrow to see all of your highlights, see a capture of the page, and send them around (NOT IMPLEMENTED)</li>';
    s += '</ol>';
    return s;
}
