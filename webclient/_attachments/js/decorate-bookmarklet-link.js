$(document).ready(
    function() {
        var bookmarklet_id = get_cookie('bookmarklet_id');
        if (bookmarklet_id == null) {
            bookmarklet_id = $.couch.newUUID();
            document.cookie = 'bookmarklet_id=' . bookmarklet_id;
        }
        else {
            alert("You already have bookmarklet " + bookmarklet_id + ".");    
        }
        var b = "javascript:(function(){";
        b += "  if(document.getElementById('flinkt.org bookmarklet') == null) {";
        b += "    s=document.createElement('script');";
        b += "    s.flinkt_init_bookmarklet_id = '" + bookmarklet_id + "';";
        b += "    s.flinkt_init_session_id = Date();";
        b += "    s.flinkt_init_bookmarklet_version = 3;";
        b += "    s.setAttribute('type','text/javascript');";
        b += "    s.setAttribute('charset','UTF-8');";
        b += "    s.setAttribute('src','http://www.flinkt.org/js/selector.js?id=" + bookmarklet_id + "&date=' + s.flinkt_init_session_id);";
        b += "    s.setAttribute('id','flinkt.org bookmarklet');";
        b += "    document.body.appendChild(s);";
        b += "  }";
        b += "  else {";
        b += "    flinkt_bookmarklet_click('" + bookmarklet_id + "')";
        b += "  }";
        b += "})();";
        var a = document.getElementById('flinkt.org bookmarklet link');
        a.href=b;
    }
);

