function(doc, req) {  
    provides("html", function() {
        var html = "<html><body><ol>\n";
        var row;
        while (row = getRow()) {
            html = html + "    <li>" + row.key + ":  " + row.value + "</li>\n";
        }
        html = html + "</ol></body></head>";
        return html;
    });
}

