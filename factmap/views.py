from django import http
from django.http import HttpResponse
from django.utils.html import escape
import pprint
from hashlib import sha1
from uuid import uuid1

# ^$
def under_construction(request):
    r = http.HttpResponse('This site is under construction.  Come back soon...')
    return r

# ^demo$
def main(request):
    r = http.HttpResponse()
    add_points(r)
    return r

def add_points(r):
    r.write('<h1>flinkt</h1>')
    r.write('<ol>')
    r.write('<li><a href="' + bookmarklet_text() + '">flinkt</a>   <==========   drag this link onto your bookmarks bar!</li>')
    r.write('<li>go to any web site (or stay right here to try it)</li>')
    r.write('<li>click the bookmark to turn on the flinkt pen ...it appears on the right</li>')
    r.write('<li>click on any statement to highlight it</li>')
    r.write('<li>hover over the highlighted statement to see options like email, digg, facebook, google+, and twitter</li>')
    r.write('<li>turn the pen on and off whenever you want by clicking on the image on the right</li>')
    r.write('<li>when you come back to the site, turn on the pen again to see your previous highlights</li>')
    r.write('<li>click on the green arrow to see all of your highlights, see a capture of the page, and send them around</li>')
    r.write('</ol>')

def bookmarklet_text():
    flinkt_id = uuid1()
    flinkt_id_str = str(flinkt_id)
    b = "javascript:(function(){"
    b += "  if(document.getElementById('flinkt.org bookmarklet') == null) {"
    b += "    s=document.createElement('script');"
    b += "    s.setAttribute('type','text/javascript');"
    b += "    s.setAttribute('charset','UTF-8');"
    b += "    s.setAttribute('src','http://flinkt.org/js/selector.js');"
    b += "    s.setAttribute('id','flinkt.org bookmarklet');"
    b += "    s.flinkt_id = '" + flinkt_id_str + "';"
    b += "    document.body.appendChild(s);"
    b += "  }"
    b += "})();"
    return b

# ^js/selector.js'
# TODO: this is only in django for composability
# ...we want to just have a static js file for the real site
def selector_js(request):
    r = http.HttpResponse('',mimetype='text/javascript')

    #r.write("alert('injecting pen')\n")
    r.write("p = document.createElement('div');\n")
    r.write("p.setAttribute('id','flinkt.org app')\n")
    #r.write("p.setAttribute('style','position:fixed; right:32px; top:32px;');\n")
    r.write("p.innerHTML = '" + pen_div_html() + "';\n")
    r.write("try { document.body.appendChild(p); } catch(e) { alert(e) };\n")

    s = '''
        var pen_status = 'off'

        function pen_on() {
            document.getElementById('flinkt.org pen on').style.zIndex = 999998;
            document.getElementById('flinkt.org pen off').style.zIndex = 999996;
            document.addEventListener('click',on_click, true);
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
            document.removeEventListener('click',on_click, true);
            document.removeEventListener('mousedown',on_mousedown, true);
            document.removeEventListener('mousemove',on_mousemove, true);
            document.removeEventListener('mouseup',on_mouseup, true);
            document.removeEventListener('touchend',on_touchend, true);
            document.removeEventListener('touchmove',on_touchmove, true);
            pen_status = 'off';
        }

        function close_click() {
            document.removeEventListener('click',on_click, true);
            document.removeEventListener('mousedown',on_mousedown, true);
            document.removeEventListener('mousemove',on_mousemove, true);
            document.removeEventListener('mouseup',on_mouseup, true);
            document.removeEventListener('touchend',on_touchend, true);
            document.removeEventListener('touchmove',on_touchmove, true);
            var a = document.getElementById('flinkt.org app');
            var b = document.getElementById('flinkt.org bookmarklet');
            if (a != null) { a.parentNode.removeChild(a); }
            if (b != null) { b.parentNode.removeChild(b); }
        }

        function site_click() {
            alert('site click');
        }

        var moving = false;

        function on_touchmove() {
            moving = true;
        }

        function on_mousedown() {
            console.log("down");
        }

        function on_mousemove(e) {
            console.log("move");
            moving = true;
        }

        function on_mouseup(e) {
            console.log("up with moving set to " + moving.toString());
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
            
        function on_click(e) {
            console.log("click with moving set to " + moving.toString());
            if (!e) e = window.event;
            e.preventDefault();
            return;
        }

        var select_count = 0;
        var statements = {};
        function statement_select(obj, e) {
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
                
                //e.cancelBubble = true;  //ie
                //e.stopPropagation();    //w3c
                e.preventDefault();    //w3c
                
                if (obj.tagName == 'IMG') {
                    // can't select images
                    return;
                }

                var prev_statement = statements[obj.id];
                if (prev_statement && prev_statement != null) {
                    statement_unselect(prev_statement);
                    return;
                }

                var selection = window.getSelection();
                var selection_range;
                var selection_range_text;
                var selection_pos; 
                if (!selection) {
                    // old IE
                    selection_range = document.selection.createRange();
                    selection_range_text = selection_range.text;
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
                    selection_range_text = selection_range.toString();
                    selection_pos = selection_range.startOffset;
                }
                
                if (selection_range_text.length != 0) {
                    //ignore regular highlights, just capture zero-width selections (clicks)
                }
                
                var statement_range = selection2statement(selection_range);

                select_count++;
                var id = 'flinkt.org selection ' + select_count;
                
                var statement_span = document.createElement("statement_span");
                statement_span.style.backgroundColor = '#FFFFAA';
                statement_span.style.backgroundColor.opacity = .3;
                statement_span.id = id; 
                statement_range.surroundContents(statement_span);
                
                statements[id] = {
                    // storable
                    id: id,
                    path: to_path(obj),
                    startOffset: statement_range.startOffset,
                    endOffset: statement_range.endOffset,
                    // transient
                    obj: obj,
                    span: statement_span,
                    range: statement_range,
                };
                console.log(statements[id]);

                // this is just debugging code as we work toward statement extraction and processing
                //document.getElementById('flinkt.org status').innerHTML = select_count + '<br>' + selection_pos + '<br><pre>' + obj.innerHTML + '</pre>';
            }
            //catch(e) { alert("error capturing selection: " + e); }
            return false;
        }

        var startPunct = /^([\\?\.\\!][\\s]+)/;    
        var endPunct = /[\\?\\.\\!]([\\s]+\\S)$/;
        function selection2statement(selection_range) {
            var statement_range = selection_range.cloneRange();
            return statement_range;

            var found_start = false;
            var prev = statement_range.startContainer.previousSibling;
            var last_working = statement_range.startContainer;
            while (1) { 
                while (statement_range.startOffset > 0) {
                    var end_of_last_sentence = startPunct.exec(statement_range.toString());
                    if (end_of_last_sentence != null) {
                        var new_start_offset = statement_range.startOffset + end_of_last_sentence[1].length;
                        if (new_start_offset > statement_range.startContainer.length - 1) {
                            // we stepped into a previous sibling to find the end of the last statement
                            // but the start of this statement is just past that edge
                            statement_range.setStart(last_working, 0); 
                        }
                        else {
                            statement_range.setStart(statement_range.startContainer, new_start_offset);
                        }
                        found_start = true;
                        break;
                    }   
                    statement_range.setStart(statement_range.startContainer, statement_range.startOffset - 1); 
                }
                if (prev != null && statements[prev.id]) {
                    // we adjoin another selected statement
                    found_start = true;
                }
                if (found_start) {
                    break;
                }
                
                while (prev && prev.nodeName != '#text' && prev.previousSibling) {
                    prev = prev.previousSibling;
                }
                if (!prev) {
                    break;
                }
                if (prev.nodeName != '#text') {
                    statement_range.setStart(prev, 0);
                    found_start = true;
                    break;
                }
                last_working = statement_range.startContainer;
                statement_range.setStart(prev, (prev.data.length > 0 ? prev.data.length - 1 : 0)); 
                prev = prev.previousSibling;
            } 

            var found_end = false;
            var next = statement_range.endContainer.nextSibling;
            last_working = statement_range.endContainer;
            while(1) {
                while (statement_range.endOffset < statement_range.endContainer.length) {
                    var beginning_of_next_sentence = endPunct.exec(statement_range.toString());
                    if( beginning_of_next_sentence != null ) { 
                        var new_end_offset = statement_range.endOffset - beginning_of_next_sentence[1].length;
                        if (new_end_offset < 0) {
                            // we stepped into a next sibling to find the beginning of the next statement
                            // but the end of this statement is just past that edge
                            statement_range.setEnd(last_working, last_working.data.length-1); 
                        }
                        else {
                            statement_range.setEnd(statement_range.endContainer, new_end_offset);
                        }
                        found_end = true;
                        break;
                    }   
                    statement_range.setEnd(statement_range.endContainer, statement_range.endOffset + 1); 
                }
                if (next != null && statements[next.id]) {
                    // we adjoin another selected statement
                    found_end = true;
                }
                if (found_end) {
                    break;
                }

                while (next && next.nodeName != '#text' && next.nextSibling) {
                    next = next.nextSibling;
                }
                if (!next) {
                    break;
                }
                if (next.nodeName != '#text') {
                    statement_range.setEnd(next, 0);
                    found_end = true;
                    break;
                }
                last_working = statement_range.endContainer;
                statement_range.setEnd(next, 0); 
                next = next.nextSibling;
            }   

            //statement_range.setStart(statement_range.startContainer, statement_range.startOffset - 1);
            //statement_range.setEnd(statement_range.endContainer, statement_range.endOffset + 1);
            return statement_range;
        }

        function statement_unselect(statement) {
            var span = statement.span;
            parent = span.parentNode;
            while (span.firstChild) {
                parent.insertBefore(span.firstChild, span);
            }
            parent.removeChild(span);
            delete statements[statement.id];
            for (var key in statement) {
                delete statement[key]; 
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

        function to_path2 (container) {
            if (container == document) {
                return "document";
            }
        
            var parent_node = container.parentNode;
            if (parent_node == null) {
                alert("I'm an orphan??");
            }
        
            var parent_path = to_path(parent_node);
        
            var child_nodes = parent_node.childNodes;
            for (var n = 0; n < child_nodes.length; n++) {
                if (child_nodes[n] == container) {
                    var path = parent_path + ".childNodes[" + n + "]";
                    //alert("got path " + path);
                    var another_me = eval(path);
                    if (another_me == container) {
                        //alert("Verified");
                        return path;
                    }
                    else {
                        alert("Not found?  Another me is " + another_me);
                    }
                }
            }
        
            if (n == child_nodes.length) {
                alert("Never found myself in my parents list of children!");
            }
            else {
                alert("How did I get here?")
            }
        }

        pen_on()
    '''

    r.write(s);
    #r.write("alert('pen injected')\n")
    return r

def pen_div_html():
    p =  '    <div style="position:fixed; top:32px; right:32px; z-index:999997;" id="flinkt.org pen off">'
    p += '      <img onclick="pen_on()" src="http://www.flinkt.org/images/pen32right.jpg">'
    p += '    </div>'
    p += '    <div style="position:fixed; top:32px; right:32px; z-index:999998;" id="flinkt.org pen on">'
    p += '      <img onclick="pen_off()" src="http://www.flinkt.org/images/pen32left.jpg">'
    p += '    </div>'
    p += '    <div style="position:fixed; top:32px; right:12px; z-index:999999;">'
    p += '      <img onclick="close_click()" src="http://www.flinkt.org/images/x12.jpg">'
    p += '    </div>'
    p += '    <div style="position:fixed; top:48px; right:8px; z-index:999999;">'
    p += '      <img onclick="site_click()" src="http://www.flinkt.org/images/right20.jpg">'
    p += '    </div>'
    return p
    p += '    <div style="position:fixed; top:64px; right:32px; width:30%; height:90%; z-index:999999; opacity:.70" id="flinkt.org status">'
    p += '    </div>'

def sha1_js():
    p = '''
/**
*
*  Secure Hash Algorithm (SHA1)
*  http://www.webtoolkit.info/
*
**/
 
function SHA1 (msg) {
 
    function rotate_left(n,s) {
        var t4 = ( n<<s ) | (n>>>(32-s));
        return t4;
    };
 
    function lsb_hex(val) {
        var str="";
        var i;
        var vh;
        var vl;
 
        for( i=0; i<=6; i+=2 ) {
            vh = (val>>>(i*4+4))&0x0f;
            vl = (val>>>(i*4))&0x0f;
            str += vh.toString(16) + vl.toString(16);
        }
        return str;
    };
 
    function cvt_hex(val) {
        var str="";
        var i;
        var v;
 
        for( i=7; i>=0; i-- ) {
            v = (val>>>(i*4))&0x0f;
            str += v.toString(16);
        }
        return str;
    };
 
 
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
 
        for (var n = 0; n < string.length; n++) {
 
            var c = string.charCodeAt(n);
 
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
 
        }
 
        return utftext;
    };
 
    var blockstart;
    var i, j;
    var W = new Array(80);
    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;
    var A, B, C, D, E;
    var temp;
 
    msg = Utf8Encode(msg);
 
    var msg_len = msg.length;
 
    var word_array = new Array();
    for( i=0; i<msg_len-3; i+=4 ) {
        j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
        msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
        word_array.push( j );
    }
 
    switch( msg_len % 4 ) {
        case 0:
            i = 0x080000000;
        break;
        case 1:
            i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
        break;
 
        case 2:
            i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
        break;
 
        case 3:
            i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8    | 0x80;
        break;
    }
 
    word_array.push( i );
 
    while( (word_array.length % 16) != 14 ) word_array.push( 0 );
 
    word_array.push( msg_len>>>29 );
    word_array.push( (msg_len<<3)&0x0ffffffff );
 
 
    for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {
 
        for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
        for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);
 
        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;
 
        for( i= 0; i<=19; i++ ) {
            temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }
 
        for( i=20; i<=39; i++ ) {
            temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }
 
        for( i=40; i<=59; i++ ) {
            temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }
 
        for( i=60; i<=79; i++ ) {
            temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }
 
        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
 
    }
 
    var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
 
    return temp.toLowerCase();
 
}
    '''

def faq(request):
    p = '''
        <br>
        <hl>
        <i><small>(The purpose of the text below is primarily to give testers things to highlight.)</small></i>
        <p>
        The flinkt <i>"magic pen"</i> lets you highlight statements on a web page quickly, then do lots of things with them easily.
        One of the handiest things you can do is get a URL which contains the highlighted line and email it around or post it.
        </p>
        <p> 
        More importantly, flinkt remembers the line, the page, and the context for you, so you can later get back to things you read.
        The flinkt site gives you your own private database, for keeping your thoughts organized ...without making you do a lot of work to organize them.
        <p>
        <h3>FAQ</h3>
        <ol>
        <li>
            Q: How is this different than fleck, diigo, clipmarks? <br>
            A: Several reasons:
            <ul>
                <li>No one wants to fill out a form.  It disrupts flow, and just sucks.</li>
                <li>Tags put too much responsibility on the user.  They are a nit-wit solution to organization.  Remember search engine meta tags?  They're only worth remembering for the lesson.</li>
                <li>Too many steps required to start using the tool. Making accounts sucks.  Inventing passwords sucks.</li>
                <li>Too many steps required to do something with the content.</li>
                <li>To send your selections to others they need to either visit the tool's site, or you need another channel fb/twitter, etc.  These require configuration and limit reach.</li>
                <li>All of them require mental investment before receiving value.</li>
            </ul>
        </li>
        <li>
            Q: What about security and privacy?<br>
            A: All user-specific information on flinkt is completely private, though you can use flinkt to send to public/social places.
               <br>
               Sites which have content sent around through flinkt get summary information on what is sent and how often, but not who.
        </li>
        <li>
            Q: I'm a web site maintainer, why would I want to put this on my site instead of the standard facebook, digg, etc. buttons?<br>
            A: You get to know the exact things on the page readers took interest in.  Because we protect reader anonymity, they can confidently share more from your site.
        </li>
        </ol>
        <h3>Links</h3>
        <ol> 
            <li>fleck: <a href="http://techcrunch.com/2008/10/16/fleck-headed-to-the-deadpool-because-nobody-wants-to-annotate-the-web/">article on fleck's demise</a></li>
            <li><a href="http://clipmarks.com">clipmarks</a></li>
                <ul>
                    <li>slick plugin, but a plugin is too cumbersome</li>
                    <li>whole paragraph</li>
                </ul>
            </li>
            <li><a href="http://amplify.com">amplify (by clipmarks people)</a>
                <ul>
                    <li>bookmarklet version of clipmarks, yea!  so it works in more than two browsers</li>
                    <li>each user gets a wordpress site for thier posts, which was what I was going to do too but with something lighter weight</li>
                    <li>also whole paragraph not line/word</li>
                    <li>my first selection, when i tried to go to <a href="http://sakoht.amplify.com">my wordpress site on their server</a> just hung</li>
                </ul>
            </li>
            <li><a href="http://www.google.com/sidewiki">google sidewiki</a>
                <ul>
                    <li>browser plugin</li>
                    <li>no highlights, just comments</li>
                </ul>
            </li>
            <li><a href="http://googlenotebookblog.blogspot.com/2009/01/stopping-development-on-google-notebook.html">google notebook stopped dev in 2009</a></li>
            <li><a href="http://news.cnet.com/seven-worthy-google-notebook-replacements/">seven google notebook replacements</li>
                <ul>
                    <li>evernote</li>
                    <li>zoho notebook: bookmarkelet takes selections, doesn't highlight them, puts them in your notebook, has lots of buttons and dials</li>
                    <li>ubernote: if you find that they have a bookmarklet, you can use it to capture whole pages/li>
                    <li>springnote: i was not able to determine if i could use it to highlight a web page line in 5 minutes</li>
                    <li>magnolia: seems that the site is gone</li>
                    <li>delicious: yahoo bought them: shared web bookmarks, requires an account, has a site</li>
                </ul>
            </li>
        </ol>
        '''
    r = http.HttpResponse(p)
    return r

