$(document).ready(
    function() {
        var flinkt_id_str = $.couch.newUUID();
        var b = "javascript:(function(){";
        b += "  if(document.getElementById('flinkt.org bookmarklet') == null) {";
        b += "    s=document.createElement('script');";
        b += "    s.flinkt_init_bookmarklet_id = '" + flinkt_id_str + "';";
        b += "    s.flinkt_init_session_id = Date();";
        b += "    s.flinkt_init_bookmarklet_version = 3;";
        b += "    s.setAttribute('type','text/javascript');";
        b += "    s.setAttribute('charset','UTF-8');";
        b += "    s.setAttribute('src','http://www.flinkt.org/js/selector.js?id=" + flinkt_id_str + "&date=' + s.flinkt_init_session_id);";
        b += "    s.setAttribute('id','flinkt.org bookmarklet');";
        b += "    document.body.appendChild(s);";
        b += "  }";
        b += "  else {";
        b += "    flinkt_bookmarklet_click('" + flinkt_id_str + "')";
        b += "  }";
        b += "})();";
        var a = document.getElementById('flinkt.org bookmarklet link');
        a.href=b;
    }
);

