
//(function() {

    var site = 'www.flinkt.org';

    var bookmarklet         = document.getElementById("flinkt.org bookmarklet");
    var bookmarklet_id      = bookmarklet.flinkt_init_bookmarklet_id;       // this identifies the browser instance
    var bookmarklet_version = bookmarklet.flinkt_init_bookmarklet_version;  // we rarely updated the bookmarklet, but when we do it's important
    var session_id          = bookmarklet.flinkt_init_session_id;           // todo: ensure the diff vs Date() is reasonable
    var user_id             = bookmarklet_id;                               // todo: get a real user id from a cookie set the first time the app is used

    function nostart() {
        var b = document.getElementById('flinkt.org bookmarklet');
        if (b != null) { b.parentNode.removeChild(b); }
    }

    if (!document.implementation.hasFeature("Range", "2.0")) {
        alert("This browser is too old to use the flinkt tool. :(\n\nTell grandma to upgrade, browsers are free!");
        nostart();
    }
    else if (bookmarklet_version != 3) {
        alert("Your testing bookmarklet is out of date!\nPlease reinstall it from www.flinkt.org/demo!");
        nostart();
    }
    else {
        load_supporting_js(start_app);
    }

    var server;
    var db;

    var pen_status;
    var bulb_status;

    var item_count = 0;

    // for debugging
    if (!document.flinkt_items) {
        document.flinkt_items = {};
    }
    if (!document.flinkt_pages_by_content) {
        document.flinkt_pages_by_content = {};
    }
    if (!document.flinkt_views) {
        document.flinkt_views = {};
    }

    var items = document.flinkt_items;
    var pages_by_content = document.flinkt_pages_by_content;
    var views = document.flinkt_views;

    ////////////////////////////

    function load_supporting_js(everything_loaded_callback) {
        var scripts = ['/js/2.3.0-crypto-sha1.js', '/_utils/script/jquery.js', '/couchdb-xd/_design/couchdb-xd/couchdb.js','/js/Math.uuid.js'];
        var n_loaded = 0;
        
        // this could be done with jQuery.getScript, but we need it to get jQuery in the first place..
        function add_js(p,callback) {
            var n = 'flinkt.org js ' + p;

            var s = document.getElementById(n);
            if (s) {
                console.log('loaded ' + p);
                callback();
            }
            else {
                s = document.createElement('script');
                s.setAttribute('type','text/javascript');
                s.setAttribute('charset','UTF-8');
                s.setAttribute('src','http://' + site + '/' + p);
                s.setAttribute('id',n);

                s.onload = function() {
                    console.log('onload ' + p);
                    callback();
                };

                s.onreadystatechange= function (s) {
                    console.log("ready state change");
                    console.log(s);
                    if (s.readyState == 'complete' ||  s.readyState == 'loaded') {
                        console.log('complete or loaded' + p);
                        callback();
                    }
                };
            }

            document.body.appendChild(s);
            return(s);
        }

        function _add_js_complete() {
            n_loaded++;
            if (n_loaded == scripts.length) {
                console.log("everything loaded");
                everything_loaded_callback();
            }
        }

        for (var n = 0; n < scripts.length; n++) {
            var path = scripts[n];
            if (! document.getElementById('flinkt.org ' + path)) {
                add_js(path, _add_js_complete);
            }
        }
    }

    var loaded = 0;
    function start_app() {
        console.log("start app");
        try { 
            Couch.init(
                function() {
                    if (loaded == 1) {
                        console.log("skipping reload");
                        return;
                    }
                    loaded = 1;
                    server = new Couch.Server('http://' + site);
                    db = new Couch.Database(server, 'flinktdb');
                    url = document.URL;
                    db.get(
                        '_design/webclient/_view/user_id_and_url?key=\["' + user_id + '","' + url + '"\]', 
                        function(result) {
                            console.log("pulled selections for user " + user_id + " for url " + url);
                            console.log(result.rows);
                            try {
                                for (var n = 0; n < result.rows.length; n++) {
                                    var id = result.rows[n].id;
                                    console.log(id);
                                    db.get(
                                        id,
                                        function(item) {
                                            console.log('result for id ' + id);
                                            console.log(item);
                                            show_item(item);
                                            items[item._id] = item;
                                        }
                                    );
                                };
                            }
                            catch(e) {
                                console.log('error loading user page data');
                                console.log(e);
                            }
                            return;
                        }
                    );
                }
            );
        }
        catch(e) {
            alert('Error starting the web client from ' + site + ': ' + e);
        }

        add_toolbar();
        pen_on();
        bulb_on();
    }

    function add_toolbar() {
        // the div at the top has elements which are internally at a fixed position
        // they should probably be relative to their parent div, which should itself be fixed
        var p = document.createElement('div');
        var s =  "<div style='position:fixed; top:32px; right:32px; z-index:999997;' id='flinkt.org pen off'>\n";
        s += "   <img onclick='pen_on()' src='http://www.flinkt.org/images/pen32right.jpg'>\n";
        s += "</div>";
        s += "<div style='position:fixed; top:32px; right:32px; z-index:999998;' id='flinkt.org pen on'>\n";
        s += "   <img onclick='pen_off()' src='http://www.flinkt.org/images/pen32left.jpg'>\n";
        s += "</div>\n";
        s += "<div style='position:fixed; top:32px; right:12px; z-index:999999;'>\n";
        s += "   <img onclick='stop_app()' src='http://www.flinkt.org/images/x12.jpg'>\n";
        s += "</div>\n";
        s += "<div style='position:fixed; top:48px; right:8px; z-index:999999;'>\n";
        s += "   <img onclick='site_click()' src='http://www.flinkt.org/images/right20.jpg'>\n";
        s += "</div>";
        s += "<div style='position:fixed; top:72px; right:32px; z-index:999997;' id='flinkt.org bulb off'>\n";
        s += "   <img onclick='bulb_on()' src='http://www.flinkt.org/images/lightbulb_off32.png'>\n";
        s += "</div>\n";
        s += "<div style='position:fixed; top:72px; right:32px; z-index:999998;' id='flinkt.org bulb on'>\n";
        s += "   <img onclick='bulb_off()' src='http://www.flinkt.org/images/lightbulb_on32.png'>\n";
        s += "</div>\n";
        p.innerHTML = s; 
        p.setAttribute('id','flinkt.org app')
        try { document.body.appendChild(p); } catch(e) { alert(e) };
    }

    function remove_toolbar() {
        var a = document.getElementById('flinkt.org app');
        if (a != null) { a.parentNode.removeChild(a); }
    }

    function stop_app() {
        // turning this off before stopping unhooks all of the event listeners
        pen_off();
        bulb_off();
        remove_toolbar();
        var b = document.getElementById('flinkt.org bookmarklet');
        if (b != null) { b.parentNode.removeChild(b); }
    }

    function flinkt_bookmarklet_click() {
        // by default we just stop the app if they re-click the bookmarklet
        // this may change over time, and we don't want to have to replace the bookmarklet, 
        // so re-clicks are caught here
        stop_app();
    }

    // events for the flinkt controls

    var ztop = 999998;
    var zbottom = 999996;

    function bulb_on() {
        document.getElementById('flinkt.org bulb on').style.zIndex = ztop;
        document.getElementById('flinkt.org bulb off').style.zIndex = zbottom;
        show_all();
    }

    function bulb_off() {
        document.getElementById('flinkt.org bulb off').style.zIndex = ztop+1;
        document.getElementById('flinkt.org bulb on').style.zIndex = zbottom-1;
        hide_all();
    }

    function pen_on() {
        document.getElementById('flinkt.org pen on').style.zIndex = ztop;
        document.getElementById('flinkt.org pen off').style.zIndex = zbottom;
        //document.addEventListener('click',on_click, true);
        document.addEventListener('mousedown',on_mousedown, true);
        document.addEventListener('mousemove',on_mousemove, true);
        document.addEventListener('mouseup',on_mouseup, true);
        document.addEventListener('touchend',on_touchend, true);
        document.addEventListener('touchmove',on_touchmove, true);
        pen_status = 'on';
    }

    function pen_off() {
        document.getElementById('flinkt.org pen off').style.zIndex = ztop;
        document.getElementById('flinkt.org pen on').style.zIndex = zbottom;
        //document.removeEventListener('click',on_click, true);
        document.removeEventListener('mousedown',on_mousedown, true);
        document.removeEventListener('mousemove',on_mousemove, true);
        document.removeEventListener('mouseup',on_mouseup, true);
        document.removeEventListener('touchend',on_touchend, true);
        document.removeEventListener('touchmove',on_touchmove, true);
        pen_status = 'off';
    }

    function site_click() {
        alert('site click');
    }

    // events for the pen

    var moving = false;

    function on_mousedown() {
        //console.log("down");
    }

    function on_mousemove(e) {
        moving = true;
    }

    function on_mouseup(e) {
        //console.log("up with moving set to " + moving.toString());
        if (!e) e = window.event;
        var o = e.target;
        if (!o) o = e.target;
        e.preventDefault();
        add_selection(o, e);
        moving = false;
    }

    function on_touchmove() {
        moving = true;
    }

    function on_touchend() {
        if (event.touches != null && event.touches.length != 0) {
            // if fingers are down, ignore this event
            // we only act upon touchend
            return;
        }
        if (moving) {
            moving = false;
            return;
        }
        var target = (event.changedTouches.length ? event.changedTouches[0].target : null);
        if (target == null) {
            alert('Error getting the touch target, counts are:' + event.touches.length + ' ' + event.changedTouches.length + ' ' + event.targetTouches.length);
            return;
        }
        
        if (target.innertHTML == null) {
            add_selection(target.parentElement, event);
        }
        else {
            add_selection(target, event);
        }
    }

    // currently, clicking on an existing selection removes it
    // later we will give a list of options on the right
    
    function on_selection_click(e) {
        if (pen_status == 'off') {
            return;
        }

        if (!e) e = window.event;
        
        var o = e.target;
        if (!o) {
            alert("no target on event ?" + e);
            return;
        }
        
        var prev_selection = o.flinkt_item;
        if (!prev_selection) {
            console.log("no selection for " + flinkt_item);
            console.log(o);
        }
        else {
            delete_item(prev_selection);
        }
        
        e.preventDefault();
    }

    // operations behind the events

    function add_selection(obj, e) {
        // selecting a region when the pen is on creates a "selection"

        // try {    // disabled for now to ensure exceptions are caught at the convienent location
        if (true) {
            if (obj == null) {
                alert('selecting null object?' + e);
                return;
            }
            if (obj.parentElement && obj.parentElement.id == 'flinkt.org app') {
                // ignore this app's control set
                alert("app");
                return;
            }
            if (pen_status != 'on') {
                alert('the selection event occurred with the pen off?');
                return;
            }
            
            var prev_statement = items[obj._id];
            if (prev_statement && prev_statement != null) {
                return;
            }

            var selection = window.getSelection();
            var range;
            if (!selection) {
                // old IE
                range = document.selection.createRange();
            }
            else {
                // not old IE
                if (!selection.getRangeAt) {
                    // old safari
                    range = document.createRange();
                    range.setStart(selection.anchorNode,selection.anchorOffset);
                    range.setEnd(selection.focusNode,selection.focusOffset);
                }
                else {
                    // everything else
                    if (selection.rangeCount == 0) {
                        // touch ...but on the iphone only the first touch hits here 
                        range = document.createRange();
                        selection.addRange(range);
                        range.setStart(obj,0);
                        range.setEnd(obj,0);
                    }
                    else {
                        // default mouse interface or touch on 2nd+ hit
                        range = selection.getRangeAt(0);
                    }
                }
            }
            
            if (
                    (range.startContainer != range.endContainer)
                    || 
                    (range.startOffset != range.endOffset)
            ) {
                // avoid zero-width selections
                add_item_from_range(range, 'selection');
            }    
        }

        //catch(e) { alert("error capturing selection: " + e); }
        return false;
    }

    function add_item_from_range(irange, itype) {
        // one item comes from a single range, but will contain multiple spans to preserve document shape
        item_count++;
        
        var text = irange.toString();
        var text_sha1 = Crypto.SHA1("blob " + text.length + "" + text); //git std

        var url = document.URL;

        // hide all selections temporarily while snapshotting the page
        // NOTE: we don't worry about the toolbar here
        var prev_html = document.body.innerHTML;
        prev_html = sanitize_html(prev_html);
        
        hide_all();
        
        var page_inner_html = document.body.innerHTML;
        page_inner_html = sanitize_html(page_inner_html);

        var start_path = to_path_pos(irange.startContainer);
        var end_path = to_path_pos(irange.endContainer);
        
        show_all();

        var sha1 = Crypto.SHA1("blob " + page_inner_html.length + "" + page_inner_html);
        var page = pages_by_content[page_inner_html];
        if (!page) {
            // save the page the first time we highlight on it
            page = {
                _id: sha1,
                content: page_inner_html,
            };
            pages_by_content[page_inner_html] = page;
            console.log("saving the page with key " + sha1);
            db.post(
                page, 
                function (result) {
                    console.log(result);
                    page._rev = result.rev;
                }
            );
        }
        else {
            console.log("found the page with id " + page.id + " revision " + page._rev);
            if (page.id != sha1) {
                console.log(page.id);
                console.log(sha1);
            }
            else {
                console.log("page id matches sha1");
            }
        }

        // this leaves it to the client to generate the UUID
        // some investigation is worthwhile into whether couchdb uuids are "better"
        var id = Math.uuid().toLowerCase().replace(/-/g,''); 

        var item = {
            _id: id,

            itype: itype,

            text: text,
            text_sha1: text_sha1,

            user_id: user_id,

            url: url,
            last_modified: document.lastModified,
            page_sha1: page.id,

            // capture the range data for reconstruction on the original doc
            // to reselect on the repal page requires more effort
            startContainer_dompath_pos: start_path, 
            endContainer_dompath_pos: end_path,
            startOffset: irange.startOffset,
            endOffset: irange.endOffset,
        };

        save_item(item);
        console.log(item);
        show_item(item);

        items[item._id] = item;
        return item;
    };

    function sanitize_html(before) {
        var strings = [
            bookmarklet_id,
            session_id,
        ];
        for (var n = 0; n < strings.length; n++) {
            var s = strings[n];
            for(;;) {
                after = before.replace(s,"XXXX");
                console.log("replaced " + s);
                if (after == before) {
                    break;
                }
                before = after;
            }
        }
        return after;
    }

    function items_list() {
        var list = [];
        for (var id in items) {
            list.push(items[id]);
        }
        return list;
    }

    function _recalculate_positions() {
        var list = items_list();
        for (var n = 0; n < list.length; n++) {
        }
        return true;
    }


    function resolve_range_for_item_by_position(item,e) {
        var s = eval(path_pos_to_js(item.startContainer_dompath_pos));
        var e = eval(path_pos_to_js(item.endContainer_dompath_pos));
        if (!s || !e) {
            console.log("failed to find start or end containers for item!");
            console.log(item);
            console.log(s);
            console.log(e);
            return;
        }
        var irange = document.createRange();
        irange.setStart(s, item.startOffset);
        try { 
            irange.setEnd(e, item.endOffset); 
        }
        catch (er) {
            console.log(er);
            console.log("error setting endOffset to " + item.endOffset);
            console.log(e);
            irange.setEnd(e.textContent ? e.textContent.length : e.childNodes.length);
        };

        // no-op
        var r = irange; 
        item.startContainer_dompath_pos = to_path_pos(r.startContainer);
        item.endContainer_dompath_pos = to_path_pos(r.endContainer);
        item.startOffset = r.startOffset;
        item.endOffset = r.endOffset;
        
        return irange;
    }

    function show_all() {
        var a = items_list();
        for (var n = 0; n < a.length; n++) {
            show_item(a[n]);
        }
        bulb_status = 'on';
    }

    function hide_all() {
        var a = items_list();
        for (var n = a.length-1; n >= 0; n--) {
            hide_item(a[n]);
        }
        bulb_status = 'off';
    }

    function show_item(item) {
        var color;
        var opacity;
        if (item.itype == 'selection') {
            color = 'yellow';
            opacity = .9;
        }

        var irange = resolve_range_for_item_by_content(item,document.documentElement);

        // wrap each element in the range in a highlighted span
        var elements = resolve_range_elements(irange);
        var spans = [];
        for (var n=0; n<elements.length; n++) {
            var e = elements[n];
            if (e.nodeName != '#text') {
                continue;
            }

            var span = document.createElement("span");
            span.style.backgroundColor = color;
            span.style.backgroundColor.opacity = opacity;
            span.id = item._id + '/' + n;

            var range = irange.cloneRange();
            range.setStart(e, (e == irange.startContainer ? irange.startOffset : 0));
            range.setEnd(e, (e == irange.endContainer ? irange.endOffset : (e.length || e.childNodes.length)));

            range.surroundContents(span);

            span.addEventListener('click',on_selection_click,true);
            span.flinkt_item = item;

            spans.push(span);
        }

        views[item._id] = spans;
        return spans;
    }

    function hide_item(item) {
        var spans = views[item._id];
        if (spans) { 
            for (var span_n = 0; span_n < spans.length; span_n++) {
                var span = spans[span_n];
                var parent = span.parentNode;
                var c;
                while (span.firstChild) {
                    c = span.firstChild;
                    parent.insertBefore(c, span);
                    if (c.nodeName == '#text') {
                        var left = c.previousSibling;
                        if (left && left.nodeName == '#text') {
                            left.textContent += c.textContent;
                            parent.removeChild(c);
                            c = left;
                        }
                    }
                }
                var prev = span.previousSibling;
                var next = span.nextSibling
                if (prev && next && prev.nodeName == '#text' && next.nodeName == '#text') {
                    var old = prev.textContent;
                    prev.textContent += next.textContent;
                    parent.removeChild(next);  
                }
                parent.removeChild(span);
            }
        }
        delete views[item._id];
        return;
    }

    var deleted_items = {};
    function delete_item(item) {
        hide_item(item);
        var id = item._id;
        deleted_items[id] = item;
        db.destroy(
            item._id,
            { rev: item._rev },
            function(result) {
                if (result.ok == true) {
                    for (var key in item) {
                        delete item[key]; 
                    }
                    delete deleted_items[id];
                    console.log("deletion worked!");
                }
                else {
                    console.log(result);
                    alert("error deleting item!\n" + item.text + "\n");
                }
            }
        );
        delete items[id];
    }

    function to_path_pos (container) {
        if (container == document) {
            return [];
        }
        var parent_node = container.parentNode;
        var child_nodes = parent_node.childNodes;
        var parent_path = to_path_pos(parent_node);
        for (var n = 0; n < child_nodes.length; n++) {
            if (child_nodes[n] == container) {
                parent_path.push(n);
                return parent_path;
            }
        }
        alert("How did I get here?")

    }

    function path_pos_to_js(p) {
        var js = 'document';
        for (var n = 0; n < p.length; n++) {
            js += '.childNodes[' + p[n] + "]";
        }
        return js;
    }


    // modified from stackoverflow question 1482832 solution 1 (Tim Down) 
    function resolve_range_elements(range) {
        var containerElement = range.commonAncestorContainer;
        if (containerElement.nodeType != 1) {
            containerElement = containerElement.parentNode;
        }

        var treeWalker = document.createTreeWalker(
            containerElement,
            NodeFilter.SHOW_TEXT,
            function(node) { return rangeIntersectsNode(range, node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; },
            false
        );

        var elmlist = [treeWalker.currentNode];
        while (treeWalker.nextNode()) {
            elmlist.push(treeWalker.currentNode);
        }
        return elmlist;
    }

    // taken verbatim from stackoverflow question 1482832 solution 1 (Tim Down) 
    function rangeIntersectsNode(range, node) {
        var nodeRange;
        if (range.intersectsNode) {
            return range.intersectsNode(node);
        } else {
            nodeRange = node.ownerDocument.createRange();
            try {
                nodeRange.selectNode(node);
            } catch (e) {
                nodeRange.selectNodeContents(node);
            }

            return range.compareBoundaryPoints(Range.END_TO_START, nodeRange) == -1 &&
                range.compareBoundaryPoints(Range.START_TO_END, nodeRange) == 1;
        }
    }

    function save_item(item) {
        db.post(
            item, 
            function (result) {
                console.log(result);
                item._rev = result.rev;
            }
        );
    }

    function resolve_range_for_item_by_content(item, e) {
        if (!e.innerHTML) {
            return;   
        }
        if (e.innerHTML.indexOf(item.text) == -1) {
            return;
        }
        var c = e.childNodes;
        var r;
        try {
            if (c && c.length && c.length > 0) {
                // the text is under this node: see if it is completely under some child node
                for (var n = 0; n < c.length; n++) {
                    r = resolve_range_for_item_by_content(item, c[n]);
                    if (r) {
                        return r;
                    }
                }
                // the text is under this node, but is not also completely under any single child node
                // make the range cover the entire set of child nodes initially, then shrink it gradually
                r = document.createRange();
                var se = c[0];
                var ee = c[c.length-1];
                r.setStart(se,0);
                r.setEnd(ee,ee.length);

                // trim nodes from the beginning 
                var sn;
                var so;
                var en;
                var eo;

                for (sn = 0; sn < c.length-1; sn++) {
                    r.setStart(c[sn+1],0);
                    if (r.toString().indexOf(item.text) == -1) {
                        break;
                    }
                }
                r.setStart(c[sn],0);
                
                // trim text from the beginning
                for (so = 0; so < c[sn].length-1; so++) {
                    r.setStart(c[sn],so+1);
                    if (r.toString().indexOf(item.text) == -1) {
                        break;
                    }
                }
                r.setStart(c[sn],so);

                // trim nodes from the end
                for (en = c.length-1; en > 0; en--) {
                    r.setEnd(c[en-1],c[en-1].length-1);
                    if (r.toString().indexOf(item.text) == -1) {
                        break;
                    }
                }
                r.setEnd(c[en],c[en].length-1);
                r.setStart(c[sn],so);

                // trim text from the end 
                for (eo = c[en].length; eo > 0; eo--) {
                    r.setEnd(c[en],eo-1);
                    if (r.toString().indexOf(item.text) == -1) {
                        break;
                    }
                }
                r.setEnd(c[en],eo);
                r.setStart(c[sn],so);
            }
            else {
                // the text is under this node, and there are no children
                r = document.createRange();
                r.setStart(e, e.innerHTML.indexOf(item.text))
                r.setEnd(e, e.innerHTML.indexOf(item.text) + item.text.length-1)
            }
        }
        catch (e) {
            console.log(e);
        }
        return r;
    }

    function cdiff(a,b) {
        var alines = a.split("\n");
        var blines = b.split("\n");
        for (var n = 0; n < alines.length; n++) {
            if (alines[n] != blines[n]) {
                console.log(n);
                console.log(alines[n]);
                console.log(blines[n]);
                return;
            }
        }
        console.log("same!");
    }

//})();
