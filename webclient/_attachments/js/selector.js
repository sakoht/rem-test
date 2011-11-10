
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
var items = {};
var views = {};

// for debugging
document.flinkt_items = items;
document.flinkt_views = views;

////////////////////////////

function load_supporting_js(everything_loaded_callback) {
    var scripts = ['/js/2.3.0-crypto-sha1.js', '/_utils/script/jquery.js', '/couchdb-xd/_design/couchdb-xd/couchdb.js','/js/Math.uuid.js'];
    var n_loaded = 0;
    
    // this could be done with jQuery.getScript, but we need it to get jQuery in the first place..
    function add_js(p,callback) {
        var n = 'flinkt.org js ' + p;

        var s = document.getElementById(n);
        if (s) {
            callback();
        }
        else {
            s = document.createElement('script');
            s.setAttribute('type','text/javascript');
            s.setAttribute('charset','UTF-8');
            s.setAttribute('src','http://' + site + '/' + p);
            s.setAttribute('id',n);

            s.onload = callback;
            s.onreadystatechange= function (s) {
                console.log("ready state change");
                console.log(s);
                if (s.readyState == 'complete' ||  s.readyState == 'loaded') {
                    console.log('complete or loaded');
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
            everything_loaded_callback();
        }
    }

    for (var n in scripts) {
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

    // start with the pen on by default
    pen_on();
    bulb_on();
}

function stop_app() {
    // turning this off before stopping unhooks all of the event listeners
    pen_off();
    bulb_off();
    var a = document.getElementById('flinkt.org app');
    var b = document.getElementById('flinkt.org bookmarklet');
    if (a != null) { a.parentNode.removeChild(a); }
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

function on_touchmove() {
    moving = true;
}

function on_mousemove(e) {
    moving = true;
}

function on_mousedown() {
    //console.log("down");
}

function on_mouseup(e) {
    //console.log("up with moving set to " + moving.toString());
    if (!e) e = window.event;
    var o = e.target;
    if (!o) o = e.target;
    e.preventDefault();
    add_selection(o, e);
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

function on_selection_click(e) {
    // currently, clicking on an existing selection removes it
    // later we will give a list of options on the right
    
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
        remove_flinkt_item(prev_selection);
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

var orig_inner_html;
var orig_inner_html_sha1;

function add_item_from_range(irange, itype) {
    // one item comes from a single range, but will contain multiple spans to preserve document shape
    item_count++;
    
    var text = irange.toString();
    var text_sha1 = Crypto.SHA1("blob " + text.length + "" + text); //git std

    var url = document.URL;

    if (!orig_inner_html) {
        orig_inner_html = document.body.innerHTML;
        orig_inner_html_sha1 = Crypto.SHA1("blob " + orig_inner_html.length + "" + orig_inner_html);
    }

    var start_path = to_path_pos(irange.startContainer);
    var end_path = to_path_pos(irange.endContainer);

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
        page_sha1: orig_inner_html_sha1,

        // capture the range data for reconstruction
        startContainer_dompath_pos: start_path, 
        endContainer_dompath_pos: end_path,
        startOffset: irange.startOffset,
        endOffset: irange.endOffset,
    };

    save_item(item);
    show_item(item);

    items[item._id] = item;
    return item;
};

function items_list() {
    var list = [];
    for (var id in items) {
        list.push(items[id]);
    }
    return list;
}

function items_sorted() {
    var list = items_list();
    list.sort(
        function (a,b) {
            var a_start = a.startContainer_dompath_pos;
            var b_start = b.startContainer_dompath_pos;
            var min_length;
            if (a_start.length < b_start.length) {
                min_length = a_start.length;
            }
            else {
                min_length = b_start.length
            }
            for (var n = 0; n < min_length; n++) {
                var diff = a_start[n] - b_start[n];
                if (diff < 0) {
                    return -1;
                }
                else if (diff > 0) {
                    return 1;
                }
            }
            return 0;
        }
    );
    return list;
}

function _recalculate_positions() {
    var list = items_list();
    for (var n = 0; n < list.length; n++) {
        
    }
    return true;
}

function resolve_range_for_item(item,e) {
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
    return irange;
}

function show_all() {
    var a = items_sorted();
    for (var n = 0; n < a.length; n++) {
        _show_item(a[n]);
    }
    bulb_status = 'on';
}

function hide_all() {
    var a = items_sorted();
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

    var irange = resolve_range_for_item(item,document.documentElement);

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

function remove_flinkt_item(item) {
    hide_item(item);
    var id = item._id;
    for (var key in item) {
        delete item[key]; 
    }
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

function load_items() {

}

