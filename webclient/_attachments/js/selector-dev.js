
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

    var deleted_items = {};
    
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
                    console.log('loaded (onload signal) script ' + p);
                    callback();
                };

                s.onreadystatechange= function (s) {
                    if (s.readyState == 'complete' ||  s.readyState == 'loaded') {
                        console.log('loaded (on ready state change: complete or loaded) script ' + p);
                        callback();
                    }
                    else {
                        console.log("loading error for script " + p);
                        console.log(s);
                    }
                };
            }

            document.body.appendChild(s);
            return(s);
        }

        function _add_js_complete() {
            n_loaded++;
            if (n_loaded == scripts.length) {
                console.log("all scripts loaded");
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
                        '_design/webclient/_view/user_url_items?key=\["' + user_id + '","' + url + '"\]&include_docs=true', 
                        function(result) {
                            console.log("loaded selections for user " + user_id + " for url " + url);
                            //console.log(result.rows);
                            //try {
                                for (var n = 0; n < result.rows.length; n++) {
                                    var id = result.rows[n].id;
                                    var item = result.rows[n].doc;
                                    var msg;
                                    if (item.text_flank == '') {
                                        msg = 'initial show ' + id + ': ' + item.text;
                                    }
                                    else {
                                        msg = 'initial show with flank ' + id + ': <' + item.text_flank + '> ' + item.text;
                                    }
                                    console.log(msg);
                                    console.log(item);
                                    show_item(item);
                                    items[item._id] = item;
                                    //db.get(
                                    //    id,
                                    //    function(item) {
                                    //        console.log('result for id ' + id);
                                    //        console.log(item);
                                    //        show_item(item);
                                    //        items[item._id] = item;
                                    //    }
                                    //);
                                };
                            //}
                            //catch(e) {
                            //    console.log('error loading user page data');
                            //    console.log(e);
                            //}
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
            
            // avoid zero-width selections
            if (
                (range.startContainer != range.endContainer)
                || 
                (range.startOffset != range.endOffset)
            ) {
                if (range.toString().length < 2) {
                    console.log("cannot select just one letter for performance reasons");
                }
                else {
                    if (range.toString().match(/\w+/)) {
                        add_item_from_range(range, 'selection');
                    }
                    else {
                        console.log("not words: '" + range.toString() + "'");
                    }
                }
            }    
        }

        //catch(e) { alert("error capturing selection: " + e); }
        return false;
    }

    function url_to_domain(url) {
        var domain = url.replace(/^.*\:\/\//,'').replace(/\/.*/,'');
        //trim down to the secondary domain name
        //var w = domain.split('.');
        //while (w.length > 2) { w.shift() }
        //domain = w.join('.');
        return domain;
    }

    function add_item_from_range(irange, itype) {
        // one item comes from a single range, but will contain multiple spans to preserve document shape
       
        var start_c = irange.startContainer;
        var start_o = irange.startOffset;
        var end_c = irange.endContainer;
        var end_o = irange.endOffset;

        var text = irange.toString();
        var text_sha1 = Crypto.SHA1("blob " + text.length + "" + text); //git std

        var url = document.URL;

        hide_all();
        remove_toolbar();

        var page_inner_html = document.body.innerHTML;
        page_inner_html = sanitize_html(page_inner_html);

        var sha1 = Crypto.SHA1("blob " + page_inner_html.length + "" + page_inner_html);
        var page = pages_by_content[sha1];
        if (!page) {
            // save the page the first time we highlight on it
          
            // this block is also below in the show code: possibly abstract out?
            var text_elements = [];
            var text_element_nodes = [];
            var tree_walker = document.createTreeWalker(
                document.body, 
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            while (tree_walker.nextNode()) {
                text_element_nodes.push(tree_walker.currentNode);
                text_elements.push(tree_walker.currentNode.textContent);
            }
            
            page = {
                _id: sha1,
                content: page_inner_html,
                text_elements: text_elements
            };
            
            pages_by_content[sha1] = page;

            console.log("saving the page with _id/key " + sha1);
            db.post(
                page, 
                function (result) {
                    console.log("page save complete for _id " + sha1);
                    console.log(result);
                    page._rev = result.rev;
                }
            );
            
            page.text_element_nodes = text_element_nodes;
            page.full_text = text_elements.join('');
        }
        else {
            console.log("found the page with _id/key " + page._id + " revision " + page._rev);
            if (page._id != sha1) {
                console.log(page._id);
                console.log(sha1);
            }
            else {
                console.log("page id matches sha1");
            }
        }

        // 1. find the position numbers of the containers bounding the range
        // 2. determine the linear position of the text in the overall full_text of the page
        var position_in_page_text = 0;
        var strings = page.text_elements;
        var nodes = page.text_element_nodes;
        var start_cn = -1;
        var end_cn = -1;
        for (var n = 0; n < nodes.length; n++) {
            if (nodes[n] == start_c) {
                start_cn = n;
                position_in_page_text += start_o;
            }
            if (nodes[n] == end_c) {
                end_cn = n;
            }
            if (start_cn == -1) {
                position_in_page_text += strings[n].length;
            }
        }
       
        // sanity check
        if (start_cn < 0 || end_cn < 0) {
            console.log(start_cn + ', ' + end_cn + ': error finding irange containers??');
            position_in_page_text = -1;
        }
        else {
            var expected = page.full_text.substr(position_in_page_text,text.length);
            if (expected == text) {
                console.log("position " + position_in_page_text + " returns expected value");
            }
            else {
                console.log("coordinate extraction for text returns unexpected: " + expected);
            }
        }

        // extend the left flank until it makes the text unique
        full_text = page.full_text;
        var n;
        for (n = position_in_page_text-1; n >= 0; n--) {
            text_with_flank = full_text.substr(n, position_in_page_text - n + text.length);
            if (full_text.indexOf(text_with_flank) == full_text.lastIndexOf(text_with_flank)) {
                console.log("text with flank is '" + text_with_flank + "'");
                break;
            }
        }
        var text_flank = full_text.substr(n, position_in_page_text - n);

        // if we have less than 100 characters of flank, get enough additional flank to reach 100
        var text_pre_flank = '';
        if (text_flank.length < 100) {
            var added_n = n - 100 + text_flank.length;
            text_pre_flank = full_text.substr(added_n, n-added_n);
        }

        add_toolbar();
        show_all();

        var domain = url_to_domain(url);

        // this leaves it to the client to generate the UUID
        // some investigation is worthwhile into whether couchdb uuids are "better"
        var id = Math.uuid().toLowerCase().replace(/-/g,''); 

        var item = {
            _id: id,

            itype: itype,

            text: text,
            text_sha1: text_sha1,

            text_flank: text_flank,
            text_pre_flank: text_pre_flank,

            user_id: user_id,
            session_id: session_id,

            url: url,
            domain: domain,

            last_modified: document.lastModified,
            page_sha1: page._id,
            position_in_page_text: position_in_page_text,
            
            // capture the range data for reconstruction on the original doc
            // in the doc we capture a list of the text elements, and here we record the positions of the elements in that list
            startContainerN: start_cn, 
            endContainerN: end_cn,
            startOffset: start_o,
            endOffset: end_o,
        };

        save_item(item);
        console.log(item);
        show_item(item);

        items[item._id] = item;
        return item;
    };

    function sanitize_html(before) {
        var encoded_session_id = encodeURIComponent(session_id);
        
        var enc = encoded_session_id; 
        for (;;) {
            var enc_new = enc.replace("(","%28").replace(")","%29").replace("%3A",":");
            if (enc_new == enc) {
                break;
            }
            enc = enc_new;
        }
        var encoded_session_id_clean = enc;

        var strings = [
            bookmarklet_id,
            session_id,
            encoded_session_id,
            encoded_session_id_clean,
        ];

        for (var n = 0; n < strings.length; n++) {
            var s = strings[n];
            for(;;) {
                after = before.replace(s,"XXXX");
                //console.log("replaced " + s);
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

    function pages_list() {
        var list = [];
        for (var id in pages_by_content) {
            list.push(pages_by_content[id]);
        }
        return list;
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

        var irange = resolve_range_for_item_by_content(item);

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
                console.log('save complete for item ' + item._id);
                console.log(result);
                item._rev = result.rev;
            }
        );
    }

    function OLD2resolve_range_for_item_by_content(item) {

        var container_list = [];
        var content_list = [];
        var tree_walker = document.createTreeWalker(
            document.body, 
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        while (tree_walker.nextNode()) {
            container_list.push(tree_walker.currentNode);
            content_list.push(tree_walker.currentNode.textContent);
        }

        var full_content = content_list.join('');
        var first_pos = full_content.indexOf(item.text_flank + item.text);
        var last_pos = full_content.lastIndexOf(item.text_flank + item.text) + item.text.length - 1;
        

        var prev_length = 0;
        var first_container_n = 0;
        var last_container_n = container_list.length - 1;
        var start_offset = 0;
        var end_offset = container_list[last_container_n].length-1;

        var r = document.createRange();
        r.setStart(container_list[first_container], start_offset);
        r.setEnd(container_list[end_container], end_offset);
        if (r.toString().indexOf(text) == -1) {
            console.log("text not in original range?");
            return;
        }

        for (var n = 1; n < container_list.length; n++) {
            
            var next_length = content_list[n].length;
            if (prev_length + next_length - 1 >= first_pos) {
                first_container_n = n;
                start_offset = first_pos - prev_length;
                break;
            }
            prev_length += next_length; 
        }

        for (var n = first_container_n; n < container_list.length; n++) {
            var next_length = content_list[n].length;
            if (prev_length + next_length > last_pos) {
                last_container_n = n;
                end_offset = last_pos - prev_length;
                break;
            }
            prev_length += next_length; 
        }

        var first_container = container_list[first_container_n];
        var last_container = container_list[last_container_n];
        r.setStart(first_container,start_offset);
        r.setEnd(last_container,end_offset);

        return r;

        // TODO: the container_list maps in some way to the text_element_nodes on the page
        // When re-loading, we don't even load the page but will need to to gather context.

        var possible_starts = [];
        var possible_ends = [];
        
        var text = item.text;
        var text_length = text.length;
        for (var n = 0; n < container_list.length; n++) {
            container = container_list[n];
            var container_text = container.textContent;
            var container_text_length = container_text.length;
            for (var offset = 0; offset < container_text_length; offset++) {
                
                // is [container,offset] a possible START for the range for the item text?
                var container_text_substr_start = container_text.substr(offset);
                if (text_length - container_text_length - offset > 0) {
                    // the item text is longer than, or as long as, the container text from this position
                    if (text.indexOf(container_text_substr_start) == 0) {
                        possible_starts.push([container,offset,container_text,container_text_substr_start]);
                    }
                }
                else {
                    // the item text is shorter than the container text from this position
                    if (container_text_substr_start.indexOf(text) == 0) {
                        possible_starts.push([container,offset,container_text,container_text_substr_start]);
                    }
                }

                // is [container,offset] a possible END for the range for the item text?
                var container_text_substr_end = container_text.substr(0,offset+1);
                if (text_length >= offset + 1) {
                    // the item text is longer than, or as long as, the container text up to this position
                    if (text.lastIndexOf(container_text_substr_end) == text_length - offset - 1) {
                        possible_ends.push([container,offset,container_text_substr_end]);
                    }
                }
                else {
                    // the item text is shorter than the container text up to this position
                    if (container_text_substr_end.lastIndexOf(text) == offset - text_length + 1) {
                        possible_ends.push([container,offset,container_text_substr_end]);
                    }
                }
            }
        }

        console.log(possible_starts);
        console.log(possible_ends);
        
        // there may be more than one range which has a plausible start and end, but not fully matching in content
        var matches = [];
        var matches_no_flank = [];
        var matches_flank_no_prev = [];
        var pre_text = '';
        for (var s = 0; s < possible_starts.length; s++) {
            for (var e = 0; e < possible_ends.length; e++) {
                var r = document.createRange();
                r.setStart(possible_starts[s][0], possible_starts[s][1]);
                r.setEnd(possible_ends[e][0], possible_ends[e][1]+1);
                console.log("CHECK: " + s + " " + e + " : " + r.toString());
                if (r.toString() == text) {
                    // range matches, now check flank
                    var pre = pre_text;
                    pre = pre + possible_starts[s][0].textContent.substr(0,possible_starts[s][1]);
                    if ( (pre.length - pre.lastIndexOf(item.text_flank)) == item.text_flank.length) {
                        // the text_flank precedes
                        var long_flank = item.text_pre_flank + item.text_flank;
                        if ( (pre.length - pre.lastIndexOf(long_flank)) == long_flank.length) {
                            matches.push(r);
                        }
                        else {
                            matches_flank_no_prev.push(r);
                        }
                    }
                    else {
                        matches_no_flank.push(r);
                    }
                }
                else {
                    console.log("MISMATCH: " + r.toString());
                }
            }
            pre_text += possible_starts[s][0].textContent;
        }
        
        console.log("matches: " + matches.length + " no flank: " + matches_no_flank.length + " no prev: " + matches_flank_no_prev.length);
        if (matches.length) {
            return matches[0];
        }
        else if (matches_flank_no_prev.length) {
            // resovles to one, but possibly out of context
            return matches_flank_no_prev[0];
        }
        else if (matches_no_flank.length) {
            // does not even resolve to one
            return matches_no_flank[0];
        }
    }

    function resolve_range_for_item_by_content(item) {

        var e1 = [];
        var tree_walker = document.createTreeWalker(
            document.body, 
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        while (tree_walker.nextNode()) {
            e1.push(tree_walker.currentNode);
        }

        // start with all text nodes
        var r1 = document.createRange();
        r1.setStart(e1[0],0);
        r1.setEnd(e1[e1.length-1], e1[e1.length-1].length-1);

        // narrow to those with flank plus the target text
        var r2 = find_range_for_text_within_range(
                item.text_flank + item.text, 
                r1
        );

        // narrow again to remove the flank
        var r3 = find_range_for_elements_within_range(
                item.text, 
                r2
        );

        return r3;
    }

    function find_range_for_text_within_range(text, irange) {
        var c = resolve_range_elements(irange);

        var sn = 0;
        var so = irange.startOffset;
        var en = c.length-1;
        var eo = irange.endOffset;

        var r = document.createRange();
        r.setStart(c[sn],so);
        r.setEnd(c[en],eo);

        // trim nodes from the beginning 
        for (; sn < c.length-1; sn++) {
            r.setStart(c[sn+1],0);
            r.setEnd(c[en],eo);
            if (r.toString().indexOf(text) == -1) {
                break;
            }
            else {
                so = 0;
            }
        }
        
        // trim text from the beginning
        for (; so < c[sn].length-1; so++) {
            r.setStart(c[sn],so+1);
            r.setEnd(c[en],eo);
            if (r.toString().indexOf(text) == -1) {
                break;
            }
        }

        // trim nodes from the end
        for (; en > 0; en--) {
            r.setStart(c[sn],so);
            console.log(c[en-1]);
            console.log(c[en-1].textContent.length - 1);
            r.setEnd(c[en-1], c[en-1].textContent.length - 1);
            if (r.toString().indexOf(text) == -1) {
                break;
            }
            else {
                eo = r.endOffset; 
            }
        }
        
        // trim text from the end 
        for (; eo > 0; eo--) {
            r.setStart(c[sn],so);
            r.setEnd(c[en],eo-1);
            if (r.toString().indexOf(text) == -1) {
                break;
            }
        }
        
        r.setStart(c[sn],so);
        r.setEnd(c[en],eo);
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
