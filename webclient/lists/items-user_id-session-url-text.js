function(doc, req) {  
    var props = ['user_id','session','url','text'];
    provides("html", function() {
        var html = "<html><body><ol>\n";
        var row;
        while (row = getRow()) {
            var doc = row.doc;
            if (doc) {
                html = html + "    <li><ul>";
                for (var n = 0; n < props.length; n++) {
                    html += '<li>' + props[n] + ': ' + doc[props[n]] + '</li>';
                }
                html += "</ul></li>\n";
            }
        }
        html = html + "</ol></body></head>";
        return html;
    });
}

