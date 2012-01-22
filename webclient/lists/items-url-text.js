function(doc, req) {  
    provides("html", function() {
        var html = "<html><body><ol>\n";
        var row;
        while (row = getRow()) {
            var doc = row.doc;
            if (doc) {
                html = html + "    <li>" + doc.url + ":  " + doc.text + "</li>\n";
            }
        }
        html = html + "</ol></body></head>";
        return html;
    });
}

