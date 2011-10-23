
var site = 'www.flinkt.org';

var bookmarklet         = document.getElementById("flinkt.org bookmarklet");
var bookmarklet_id      = bookmarklet.flinkt_init_bookmarklet_id;       // this identifies the browser instance
var bookmarklet_version = bookmarklet.flinkt_init_bookmarklet_version;  // we rarely updated the bookmarklet, but when we do it's important
var session_id          = bookmarklet.flinkt_init_session_id;           // todo: ensure the diff vs Date() is reasonable
var user_id             = bookmarklet_id;                               // todo: get a real user id from a cookie set the first time the app is used

if (bookmarklet_id && bookmarklet_version == 3) {
    load_supporting_js(start_app);
}
else {
    alert("Your testing bookmarklet is out of date!\nPlease reinstall it from www.flinkt.org/demo!");
    var b = document.getElementById('flinkt.org bookmarklet');
    if (b != null) { b.parentNode.removeChild(b); }
}

var server;
var db;
var pen_status;
var select_count = 0;
var selections = {};


////////////////////////////

function load_supporting_js(everything_loaded_callback) {
    var scripts = ['/js/2.3.0-crypto-sha1.js', '/_utils/script/jquery.js', '/couchdb-xd/_design/couchdb-xd/couchdb.js','/js/jquery.ba-postmessage.js'];
    var n_loaded = 0;
    
    // this could be done with jQuery.getScript, but we need it to get jQuery in the first place..
    function add_js(p,callback) {
        var n = 'flinkt.org js ' + p;
        
        s = document.createElement('script');
        s.setAttribute('type','text/javascript');
        s.setAttribute('charset','UTF-8');
        s.setAttribute('src','http://' + site + '/' + p);
        s.setAttribute('id',n);

        s.onload = callback;
        s.onreadystatechange= function (s) {
            if (s.readyState == 'complete' ||  s.readyState = 'loaded') callback();
        };

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

function start_app() {
    try { 
        Couch.init(
            function() {
                server = new Couch.Server('http://' + site);
                db = new Couch.Database(server, 'flinktdb');
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
    s += "<div style='position:fixed; top:64px; right:32px; z-index:999997;' id='flinkt.org bulb off'>\n";
    s += "   <img offclick='bulb_off()' src='http://www.flinkt.org/images/lightbulb_off32.png'>\n";
    s += "</div>\n";
    s += "<div style='position:fixed; top:64px; right:32px; z-index:999998;' id='flinkt.org bulb on'>\n";
    s += "   <img onclick='bulb_off()' src='http://www.flinkt.org/images/lightbulb_on32.png'>\n";
    s += "</div>\n";
    p.innerHTML = s; 
    p.setAttribute('id','flinkt.org app')
    try { document.body.appendChild(p); } catch(e) { alert(e) };

    // start with the pen on by default
    pen_on();
}

function stop_app() {
    // turning this off before stopping unhooks all of the event listeners
    pen_off();
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

function pen_on() {
    document.getElementById('flinkt.org pen on').style.zIndex = 999998;
    document.getElementById('flinkt.org pen off').style.zIndex = 999996;
    //document.addEventListener('click',on_click, true);
    document.addEventListener('mousedown',on_mousedown, true);
    document.addEventListener('mousemove',on_mousemove, true);
    document.addEventListener('mouseup',on_mouseup, true);
    document.addEventListener('touchend',on_touchend, true);
    document.addEventListener('touchmove',on_touchmove, true);
    pen_status = 'on';
}

function pen_off() {
    document.getElementById('flinkt.org pen off').style.zIndex = 99998;
    document.getElementById('flinkt.org pen on').style.zIndex = 99997;
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
    statement_select(o, e);
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
        statement_select(target.parentElement, event);
    }
    else {
        statement_select(target, event);
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
        console.log("no selection for " + flinkt_item_id);
        console.log(o);
    }
    else {
        remove_flinkt_item(prev_selection);
        delete selections[prev_selection.id];
    }
    
    e.preventDefault();
}
    
function statement_select(obj, e) {
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
        
        var prev_statement = selections[obj.id];
        if (prev_statement && prev_statement != null) {
            return;
        }

        var selection = window.getSelection();
        var selection_range;
        if (!selection) {
            // old IE
            selection_range = document.selection.createRange();
        }
        else {
            // not old IE
            if (!selection.getRangeAt) {
                // old safari
                selection_range = document.createRange();
                selection_range.setStart(selection.anchorNode,selection.anchorOffset);
                selection_range.setEnd(selection.focusNode,selection.focusOffset);
            }
            else {
                // everything else
                if (selection.rangeCount == 0) {
                    // touch ...but on the iphone only the first touch hits here 
                    selection_range = document.createRange();
                    selection.addRange(selection_range);
                    selection_range.setStart(obj,0);
                    selection_range.setEnd(obj,0);
                }
                else {
                    // default mouse interface or touch on 2nd+ hit
                    selection_range = selection.getRangeAt(0);
                }
            }
        }
        
        select_count++;
        var selection_item = add_flinkt_item('selection', selection_range, 'yellow', .9, 'flinkt.org selection ' + select_count);
        
        //var statement_range = selection2statement(selection_range);
        //var statement_item = add_flinkt_item('statement', statement_range, '#FFFFDD', .1, 'flinkt.org statement ' + select_count);
        //selection_item.parent = statement_item;

        selections[selection_item.id] = selection_item;
        document.flinkt_selections = selections;
    }

    //catch(e) { alert("error capturing selection: " + e); }
    return false;
}

function add_flinkt_item(itype, irange, color, opacity, id) {
    // one item comes from a single range, but will contain multiple spans to preserve document shape
    var text = irange.toString();
    var item = {
        id: id,
        itype: itype,
        color: color,
        opacity: opacity,

        text: text,
        sha1: Crypto.SHA1("blob " + text.length + "" + text), //git std
        
        url: document.URL,
        last_modified: document.lastModified,

        // capture the range data for reconstruction
        startContainer_dompath: to_path(irange.startContainer),
        endContainer_dompath: to_path(irange.endContainer),
        startOffset: irange.startOffset,
        endOffset: irange.endOffset,
    
    };

    // wrap each element in the range in a highlighted span
    var elements = resolve_range_elements(irange);
    var spans = [];
    for (var n=0; n<elements.length; n++) {
        var e = elements[n];
        if (e.nodeName != '#text') {
            //console.log(e.nodeName + ' skipped');
            continue;
        }

        var span = document.createElement("span");
        span.style.backgroundColor = color;
        span.style.backgroundColor.opacity = opacity;
        span.id = id + '.' + n;

        var range = irange.cloneRange();
        range.setStart(e, (e == irange.startContainer ? irange.startOffset : 0));
        range.setEnd(e, (e == irange.endContainer ? irange.endOffset : (e.length || e.childNodes.length)));

        range.surroundContents(span);

        span.addEventListener('click',on_selection_click,true);
        span.flinkt_item = item;

        spans.push(span);
    }

    item.spans = spans;
    
    return item;
};

function remove_flinkt_item(item) {
    var spans = item.spans;
    if (!spans) return;
    for (var span_n in spans) {
        var span = spans[span_n];
        var parent = span.parentNode;
        while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
    }
    for (var key in item) {
        delete item[key]; 
    }
}

function to_path (container) {
    if (container == document) {
        return "document";
    }
    var parent_node = container.parentNode;
    var child_nodes = parent_node.childNodes;
    var parent_path = to_path(parent_node);
    for (var n = 0; n < child_nodes.length; n++) {
        if (child_nodes[n] == container) {
            var path = parent_path + ".childNodes[" + n + "]";
            return path;
        }
    }
    alert("How did I get here?")
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
    //console.log("checking " + node.toString());
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

/////////////////

var formpost_n = 0;
function formpost(obj, callback) {
    formpost_n++;

    var t = document.createElement("iframe");
    t.name = 'temp iframe for form post ' + formpost_n;
    t.id = t.name;
    document.documentElement.appendChild(t);

    var f = document.createElement("form");
    f.action = 'http://' + site + '/flinktdb/_design/webclient/_update/formpost';
    f.method = 'POST';
    f.target = t.name;
    for (k in obj) {
        var i = document.createElement("input");
        i.name = k;
        i.value = obj[k]
        f.appendChild(i)
    }

    var done = function(o) {
        alert('loading signal ' + o.readyState + ' from ' + o);
    };
    t.onload = done;
    t.onreadystatechange = done;

    f.submit();
}

