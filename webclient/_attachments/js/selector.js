        
// This gets run any time the user clicks the bookmarklet.
// When we are no longer in development, it should be wrapped in a closure to keep
// other things out of the data structures.

var previously_started;
if (previously_started) {
    // set application/session globals: it is important that this run every time in case the user switches bookmarklets
    // restart the app without re-creating data structures and closures
    identify_app_and_session();
    start_app();
}
else {
    // create a fresh set of data structures and closures, then start the app
    
    if (!document.implementation.hasFeature("Range", "2.0")) {
        alert("This browser is too old to use the flinkt tool. :(\n\nTell grandma to upgrade, browsers are free!");
        nostart();
        throw "this browser does not rupport Range 2.0, and cannot run the flinkt web client";
    }

    previously_started = true;

    var site = 'www.flinkt.org';

    var bookmarklet;
    var bookmarklet_id; 
    var bookmarklet_version; 
    var session_id; 
    var user_id;

    var server;
    var db;

    var pen_status;
    var bulb_status;

    var items = {}; 
    var deleted_items = {};
    var views = {};
    var pages_by_content = {}; 
  

    // function definitions must be declared before the calls in firefox 11, though chrome and safari don't care 
    
    function nostart() {
        var b = document.getElementById('flinkt.org bookmarklet');
        if (b != null) { b.parentNode.removeChild(b); }
    }

    function identify_app_and_session() {
        bookmarklet = document.getElementById("flinkt.org bookmarklet");
        if (bookmarklet) {
            // started from a bookmarklet
            if (bookmarklet_id && (bookmarklet_id != bookmarklet.flinkt_init_bookmarklet_id)) {
                alert("Switching apps from " + bookmarklet_id + " to " + bookmarklet.flinkt_init_bookmarklet_id);
                loaded = false;
            }
            bookmarklet_id      = bookmarklet.flinkt_init_bookmarklet_id;       // this identifies the browser instance
            bookmarklet_version = bookmarklet.flinkt_init_bookmarklet_version;  // we rarely updated the bookmarklet, but when we do it's important
            session_id          = bookmarklet.flinkt_init_session_id;           // todo: ensure the diff vs Date() is reasonable
            user_id = bookmarklet_id;
            if (bookmarklet_version != 3) {
                alert("Your testing bookmarklet is out of date!\nPlease reinstall it from " + site + "/demo!");
                nostart();
                throw "The flinkt bookmarklet is out of date.  Please reinstall from " + site + "."
            }
        }
        else {
            // started from a page which includes this js directly
            // TODO: the bookmarklet_id is really the app_id, which is used to help infer user_id
            // For sites which have a built-in app they will have to rely entirely on the cookie in the iframe
            bookmarklet_id = 'NA';
            bookmarklet_version = 3;
            session_id = Date();
            user_id = bookmarklet_id;
        }
    }

    function load_supporting_js(everything_loaded_callback) {
        var scripts = ['/js/2.3.0-crypto-sha1.js', '/_utils/script/jquery.js', '/couchdb-xd/_design/couchdb-xd/couchdb.js','/js/Math.uuid.js','/js/jquery.cookies.2.2.0.js','/js/jquery.ba-postmessage.js'];
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

    var loaded = false; 
    function start_app() {
        console.log("start app");
        
        try {
            Couch.init(
                function() {
                    // sadly, this function can be called repeatedly
                    // and that really messes things up
                    if (loaded == true) {
                        console.log("skipping reload");
                        return;
                    }
                    loaded = true;

                    
                    url = document.URL;
                    
                    // connect to the database
                    server = new Couch.Server('http://' + site);
                    db = new Couch.Database(server, 'flinktdb');
                    db.get(
                        '_design/webclient/_view/items-by-user_id-and-url?key=\["' + user_id + '","' + url + '"\]&include_docs=true', 
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
                                    show_count();
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
        show_all();
    }

    function stop_app() {
        // turning this off before stopping unhooks all of the event listeners
        pen_off();
        bulb_off();
        remove_toolbar();

        // remove the bookmarklet to clean up after ourselves
        // Note that the code stays in scope (at least in Chrome)
        // so we hold a reference to the bookmarklet to avoid re-defining these functions
        // if they re-activate the highlighter on the same page later.
        var b = document.getElementById('flinkt.org bookmarklet');
        if (b != null) {
            b.parentNode.removeChild(b); 
            previously_started = 1; 
        }
    }

    function flinkt_bookmarklet_click() {
        // by default we just stop the app if they re-click the bookmarklet
        // this may change over time, and we don't want to have to replace the bookmarklet, 
        // so re-clicks go here instead of directly to stop_app() 
        
        var bookmarklet = document.getElementById('flinkt.org bookmarklet');
        if (bookmarklet.flinkt_init_bookmarklet_id != bookmarklet_id) {
            // this never actually runs TODO
            alert("different");
            identify_app_and_session();
            stop_app();
            start_app();
        }
        else {
            stop_app();
        }
    }

    // events for the flinkt controls

    var zbottom = 999996;
    var zmid    = 999997;
    var ztop    = 999998;
    var ovisible = 9;
    var ohidden = 0;

    function bulb_on() {
        return; // the bulb is not currently produced
        console.log("bulb on");
        if (false) {
            // the bulb is not shown anymore, we may re-add it later
            document.getElementById('flinkt.org bulb on').style.zIndex = ztop+1;
            document.getElementById('flinkt.org bulb on').style.opacity = ovisible;
            document.getElementById('flinkt.org bulb off').style.zIndex = zbottom-1;
            document.getElementById('flinkt.org bulb off').style.opacity = ohidden;
        }
        show_all();
    }

    function bulb_off() {
        console.log("bulb off");
        if (false) {
            // the bulb is not shown anymore, we may re-add it later
            document.getElementById('flinkt.org bulb off').style.zIndex = ztop+1;
            document.getElementById('flinkt.org bulb off').style.opacity = ovisible;
            document.getElementById('flinkt.org bulb on').style.zIndex = zbottom-1;
            document.getElementById('flinkt.org bulb on').style.opacity = ohidden;
        }
        hide_all();
    }

    function pen_off() {

    }

    function pen_on() {
        document.getElementById('flinkt.org pen').style.backgroundPositionY = '0px';

        //document.addEventListener('click',on_click, true);
        document.addEventListener('mousedown',on_mousedown, true);
        document.addEventListener('mousemove',on_mousemove, true);
        document.addEventListener('mouseup',on_mouseup, true);
        document.addEventListener('touchend',on_touchend, true);
        document.addEventListener('touchmove',on_touchmove, true);

        pen_status = 'on';
    }

    function pen_off() {
        document.getElementById('flinkt.org pen').style.backgroundPositionY = '32px';

        //document.removeEventListener('click',on_click, true);
        document.removeEventListener('mousedown',on_mousedown, true);
        document.removeEventListener('mousemove',on_mousemove, true);
        document.removeEventListener('mouseup',on_mouseup, true);
        document.removeEventListener('touchend',on_touchend, true);
        document.removeEventListener('touchmove',on_touchmove, true);

        pen_status = 'off';
    }

    function pen_toggle() {
        if (pen_status == 'off') {
            pen_on();
        }
        else {
            pen_off();
        }
    }

    function save_on() {
        document.getElementById('flinkt.org save button').style.opacity = ovisible;
    }

    function save_off() {
        document.getElementById('flinkt.org save button').style.opacity = ohidden;
    }

    function save_click() {
        alert('save');
    }

    function site_click() {
        alert('TODO: go to the flinkt.org site, or bring in an iframe.');
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

    var toolbar_parent;
    var toolbar;
    function add_toolbar() {
        if (toolbar_parent) {
            toolbar.hidden = true;
            toolbar_parent.appendChild(toolbar);
            //jQuery(toolbar).fadeIn('fast');
            toolbar.hidden = false;
            return;
        }

        // TODO: switch to css?  

        var toolbar_div = document.createElement('div');
        toolbar_div.setAttribute('id','flinkt.org app');
        toolbar_div.style.position = 'fixed';
        toolbar_div.style.right = '25px';
        toolbar_div.style.width = '46px';
        toolbar_div.style.top = '28px';
        toolbar_div.style.marginBottom = '7px';

        bottom_div = document.createElement('div');
        bottom_div.style.position = 'absolute';
        bottom_div.style.width = '100%';
        bottom_div.style.height = '100%';
        bottom_div.style.zIndex = zbottom;
        bottom_div.style.backgroundColor = 'black';
        bottom_div.style.opacity = .2;
        toolbar_div.appendChild(bottom_div);

        top_div = document.createElement('div');
        top_div.style.position = 'absolute';
        top_div.style.width = '100%';
        top_div.style.height = '100%';
        top_div.style.zIndex = ztop;
        top_div.style.opacity = 1;
        toolbar_div.appendChild(top_div);
        top_div = toolbar_div;

        pen_div = document.createElement('div');
        pen_div.setAttribute('id','flinkt.org pen');
        pen_div.style.position = 'relative';
        pen_div.style.zIndex = ztop;
        pen_div.style.marginLeft = '7px';
        pen_div.style.marginTop = '7px';
        pen_div.style.width = '32px';
        pen_div.style.height = '32px';
        pen_div.style.marginBottom = '7px';
        pen_div.style.overflow = 'hidden';
        pen_div.style.backgroundImage = 'url("http://' + site + '/images/pen32stacked-red.png")'
        pen_div.addEventListener('click',pen_toggle,true);
        top_div.appendChild(pen_div);
        
        count_div = document.createElement('div');
        count_div.setAttribute('id','flinkt.org counter');
        count_div.style.position = 'relative';
        count_div.style.zIndex = ztop;
        count_div.style.textAlign = 'center';
        count_div.style.marginTop = '10px';
        count_div.style.marginBottom = '7px';
        count_div.style.color = 'white';
        count_div.innerHTML = '<b></b>';
        top_div.appendChild(count_div);
        
        mail_div = document.createElement('div');
        mail_div.setAttribute('id','flinkt.org email button');
        mail_div.style.position = 'relative';
        mail_div.style.zIndex = ztop;
        mail_div.style.marginLeft = '7px';
        mail_div.style.marginTop = '7px';
        mail_div.style.marginBottom = '7px';
        mail_div.style.width = '32px';
        mail_div.style.height = '32px';
        mail_div.style.backgroundImage = 'url("http://' + site + '/images/mail32.png")'
        mail_div.addEventListener('click',function() { mail() },true);
        top_div.appendChild(mail_div);

        // talk to flinkt.org to keep flinkt cookies out of the host page
        /*
        i = document.createElement('iframe');
        i.setAttribute('id','flinkt.org toolbar-home');
        i.frameBorder = 0;
        i.scrolling = "no";
        i.src = "http://" + site + "/pages/toolbar-home.html#" + bookmarklet_id + "#"+ encodeURIComponent(document.location.href);
        toolbar_div.appendChild(i);
        */

        try { 
            //toolbar_div.hidden = true;
            document.body.appendChild(toolbar_div);
            //console.log("fadeIn");
            jQuery(toolbar_div).fadeIn('slow');
            //document.ft = toolbar_div;
        } 
        catch(e) { 
            alert(e) 
        };
    }

    function remove_toolbar() {
        toolbar = document.getElementById('flinkt.org app');
        //jQuery(toolbar).fadeOut('fast');
        toolbar.hidden = true;
        if (toolbar != null) { 
            toolbar_parent = toolbar.parentNode;
            toolbar_parent.removeChild(toolbar); 
        }
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
                // alert("app");
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
        
        // we'd like to do this only for new pages, but browsers arbitrarily munge text nodes ...and so do we 
        var text_element_strings = [];
        var text_element_nodes = [];
        var tree_walker = document.createTreeWalker(
            document.body, 
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        while (tree_walker.nextNode()) {
            text_element_nodes.push(tree_walker.currentNode);
            text_element_strings.push(tree_walker.currentNode.textContent);
        }

        // 1. find the position numbers of the containers bounding the range
        // 2. determine the linear position of the text in the overall full_text of the page
        var position_in_page_text = 0;
        var start_cn = -1;
        var end_cn = -1;
        var start_c = irange.startContainer;
        var start_o = irange.startOffset;
        var end_c = irange.endContainer;
        var end_o = irange.endOffset;
        for (var n = 0; n < text_element_nodes.length; n++) {
            if (text_element_nodes[n] == start_c) {
                start_cn = n;
                position_in_page_text += start_o;
            }
            if (text_element_nodes[n] == end_c) {
                end_cn = n;
            }
            if (start_cn == -1) {
                position_in_page_text += text_element_strings[n].length;
            }
        }
       
        // sanity check that we found the positions
        if (start_cn < 0 || end_cn < 0) {
            alert(start_cn + ', ' + end_cn + ': error finding irange containers??');
            return;
        }
        
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
            
            page = {
                _id: sha1,
                content: page_inner_html,
                text_elements: text_element_strings
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
            
        }
        else {
            console.log("found the page with _id/key " + page._id + " revision " + page._rev);
            page.text_elements = text_element_strings;
        }

        // sanity check the page full text 
        var full_text = text_element_strings.join('');
        var expected = full_text.substr(position_in_page_text,text.length);
        if (expected == text) {
            console.log("position " + position_in_page_text + " returns expected value");
        }
        else {
            console.log("coordinate extraction for text returns unexpected: " + expected);
        }

        // extend the left flank until it makes the text unique
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
        var text_context = '';
        if (text_flank.length < 100) {
            var context_start_pos = n - 100 + text_flank.length;
            if (context_start_pos < 0) {
                context_start_pos = 0;
            }
            text_context = full_text.substr(context_start_pos, n-context_start_pos);
        }

        console.log("restoring toolbar...");
        add_toolbar();
        console.log("showing all...");
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
            text_context: text_context,

            user_id: user_id,
            session_id: session_id,

            url: url,
            domain: domain,

            last_modified: document.lastModified,
            page_sha1: page._id,
            position_in_page_text: position_in_page_text,
        };

        console.log("showing item...");
        console.log(item);
        if (show_item(item)) {
            items[item._id] = item;
            console.log("showing count...");
            show_count();
            console.log("saving...");
            save_item(item);
            console.log("returning...");
            return item;
        }
        else {
            alert("error showing item: please report this error...");
            return;
        }
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
        var irange = resolve_range_for_item_by_content(item);
        if (!irange) {
            return;
        }

        var color;
        var opacity;
        if (item.itype == 'selection') {
            color = 'yellow';
            opacity = .9;
        }

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
        var id = item._id;
        hide_item(item);
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
        show_count();
    }

    function show_count() {
        count_div.innerHTML = '<b><big>' + (items_list().length) + '</big></b>';
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
        console.log("save begin " + item._id);
        db.post(
            item, 
            function (result) {
                console.log('save complete for item ' + item._id);
                console.log(result);
                item._rev = result.rev;
            }
        );
        console.log("save sent " + item._id);
    }

    function resolve_range_for_item_by_content(item) {

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

        // TODO: the container_list maps in some way to the text_element_nodes on the page
        // When re-loading, we don't even load the page but will need to to gather context.

        var possible_starts = [];
        var possible_ends = [];
        
        var text = item.text;
        var text_length = text.length;
        var previous_full_text = '';
        var previous_full_text_by_container_number = {};
        var first_character = text.substr(0,1);
        var last_character = text.substr(text.length-1,1);
        for (var n = 0; n < container_list.length; n++) {
            container = container_list[n];
            var container_text = container.textContent;
            var container_text_length = container_text.length;
            var match_count_for_this_start_container = 0;
            for (var offset = 0; offset < container_text_length; offset++) {
                
                // is [container,offset] a possible START for the range for the item text?
                var container_text_substr_start = container_text.substr(offset);
                if (text_length - container_text_length + offset > 0) {
                    // the item text is longer than, or as long as, the container text from this position
                    if (text.indexOf(container_text_substr_start) == 0) {
                        possible_starts.push([container,offset,n]);
                        match_count_for_this_start_container++;
                    }
                }
                else {
                    // the item text is shorter than the container text from this position
                    if (container_text_substr_start.indexOf(text) == 0) {
                        possible_starts.push([container,offset,n]);
                        match_count_for_this_start_container++;
                    }
                }

                // is [container,offset] a possible END for the range for the item text?
                var container_text_substr_end = container_text.substr(0,offset+1);
                if (text_length >= offset + 1) {
                    // the item text is longer than, or as long as, the container text up to this position
                    if (text.lastIndexOf(container_text_substr_end) == text_length - offset - 1) {
                        possible_ends.push([container,offset,n]);
                    }
                }
                else {
                    // the item text is shorter than the container text up to this position
                    if (container_text_substr_end.lastIndexOf(text) == offset - text_length + 1) {
                        possible_ends.push([container,offset,n]);
                    }
                }
            }
            if (match_count_for_this_start_container > 0) {
                previous_full_text_by_container_number[n] = previous_full_text;
            }
            previous_full_text = previous_full_text + container_text;
        }

        //console.log(possible_starts);
        //console.log(possible_ends);
        
        // there may be more than one range which has a plausible start and end, but not fully matching in content
        var matches = [];
        var matches_no_flank = [];
        var matches_flank_no_prev = [];
        var allnl = new RegExp("\n",'g');
        ///console.log("ITEM: " + item.text.replace(allnl,'\\n'));
        //console.log("FLANK: " + item.text_flank.replace(allnl,'\\n'));
        //console.log("CONTEXT: " + item.text_context.replace(allnl,'\\n'));
        for (var s = 0; s < possible_starts.length; s++) {
            var text_from_prev_elements;
            text_from_prev_elements = previous_full_text_by_container_number[possible_starts[s][2]];
            if (text_from_prev_elements == null) {
                alert("no text for element?");
            }
            for (var e = 0; e < possible_ends.length; e++) {
                var r = document.createRange();
                r.setStart(possible_starts[s][0], possible_starts[s][1]);
                r.setEnd(possible_ends[e][0], possible_ends[e][1]+1);
                //console.log("CHECK: " + r.toString());
                //console.log(" START: " + [s, possible_starts[s][0].textContent.replace(new RegExp("\n",'g'),'\\n'),possible_starts[s][1]].join(" ") );
                //console.log(" END: " + [e, possible_ends[e][0].textContent.replace(new RegExp("\n",'g'),'\\n'),possible_ends[e][1]].join(" ") );
                if (r.toString() == text) {
                    //console.log(" MATCH TEXT"); 
                    var pre = text_from_prev_elements;
                    pre = pre + possible_starts[s][0].textContent.substr(0,possible_starts[s][1]);
                    if ( (pre.length - pre.lastIndexOf(item.text_flank)) == item.text_flank.length) {
                        //console.log("  MATCH FLANK");
                        var long_flank = item.text_context + item.text_flank;
                        if ( (pre.length - pre.lastIndexOf(long_flank)) == long_flank.length) {
                            //console.log("   MATCH CONTEXT");
                            matches.push(r);
                        }
                        else {
                            //console.log("   NOT CONTEXT");
                            matches_flank_no_prev.push(r);
                        }
                    }
                    else {
                        //console.log("  NOT FLANK");
                        matches_no_flank.push(r);
                    }
                }
                else {
                    //console.log(" NOT TEXT");
                }
            }
        }
        
        //console.log("matches with flank and context: " + matches.length + ", flank but not context: " + matches_flank_no_prev.length + ", no flank at all: " + matches_no_flank.length);
        if (matches.length) {
            return matches[0];
        }
        else if (matches_flank_no_prev.length) {
            // resovles to one, but possibly out of context
            console.log("selection has changed context:\n" + matches_flank_no_prev[0].toString() + "\n" + item.text_context + item.text_flank);
            return matches_flank_no_prev[0];
        }
        else if (matches_no_flank.length) {
            // does not even resolve to one
            console.log("selection has changed context and is no longer unambiguous:\n" + matches_no_flank[0].toString() + "\n" + item.text_context + item.text_flank);
            //return matches_no_flank[0];
            return;
        }
        else {
            console.log("selection is missing: " + item.text);
            return;
        }
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

    function fe(f) {
        db.get(
            "_all_docs?include_docs=true", 
            function(r) { 
                for(n = 0; n < r.rows.length; n++) { 
                    console.log(f(r.rows[n].doc)) 
                } 
            }
        );
    }

    function get_cookie(name) {
        var pos = document.cookie.indexOf(name);
        if (pos == -1) {
            return null;
        }
        var value = document.cookie.substr(pos+name.length+1);
        pos = value.indexOf(';');
        if (pos != -1) {
            value = value.substr(0,pos);
        }
        return value;
    }

    // end function declarations

    identify_app_and_session();

    if (document.body) {
        load_supporting_js(start_app);
    }
    else {
        $(document).ready(
            function() {
                load_supporting_js(start_app);
            }
        );
    }
}

