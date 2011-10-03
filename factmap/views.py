# Create your views here.
from django import http
from django.http import HttpResponse
from django.utils.html import escape
import pprint

# ^$
def under_construction(request):
    r = http.HttpResponse('This site is under construction.  Come back soon...')
    return r

# ^demo$
def main(request):
    r = http.HttpResponse()
    add_points(r)
    return r

def testo(request):
    r = http.HttpResponse()
    r.write('<head><script type="text/javascript" src="http://flinkt.org/js/selector.js" id="flinkt.org bookmarklet"></script></head>')
    r.write('<body>')
    add_points(r)
    r.write('</body>')
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
    b = "javascript:(function(){"
    b += "  if(document.getElementById('flinkt.org bookmarklet') == null) {"
    b += "    s=document.createElement('script');"
    b += "    s.setAttribute('type','text/javascript');"
    b += "    s.setAttribute('charset','UTF-8');"
    b += "    s.setAttribute('src','http://flinkt.org/js/selector.js');"
    b += "    s.setAttribute('id','flinkt.org bookmarklet');"
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
            document.addEventListener('mouseup',on_click, true);
            document.addEventListener('touchend',on_touchend, true);
            document.addEventListener('touchmove',on_touchmove, true);
            pen_status = 'on';
        }

        function pen_off() {
            document.getElementById('flinkt.org pen off').style.zIndex = 99998;
            document.getElementById('flinkt.org pen on').style.zIndex = 99997;
            document.removeEventListener('mouseup',on_click, true);
            document.removeEventListener('touchend',on_touchend, true);
            document.removeEventListener('touchmove',on_touchmove, true);
            pen_status = 'off';
        }

        function close_click() {
            document.removeEventListener('click',on_click, true);
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

        var moving = 0;
        function on_touchmove() {
            moving = 1;
        }

        function on_touchend() {
            if (event.touches != null && event.touches.length != 0) {
                // if fingers are down, ignore this event
                // we only act upon touchend
                return;
            }
            if (moving) {
                moving = 0;
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
            if (!e) e = window.event;
            var o = e.target;
            if (!o) o = e.target;
            statement_select(o, e);
        }

        var select_count = 0;
        var selections = {};
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
                if (obj.tagName == 'IMG') {
                    // can't select images
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

                var id = 'flinkt.org selection ' + select_count;

                var statement_span = document.createElement("statement_span");
                statement_span.style.backgroundColor = "yellow";
                statement_span.id = id; 
                statement_range.surroundContents(statement_span);

                document.flinkt_selection_range = selection_range;;
                document.flinkt_statement_range = statement_range;
                document.flinkt_statement_span = statement_span;
                document.flinkt_selections = selections;

                //e.cancelBubble = true;  //ie
                //e.stopPropagation();    //w3c
                //e.preventDefault();    //w3c

                // this is just debugging code as we work toward statement extraction and processing
                select_count++;
                document.getElementById('flinkt.org status').innerHTML = select_count + '<br>' + selection_pos + '<br><pre>' + obj.innerHTML + '</pre>';
            }
            //catch(e) { alert("error capturing selection: " + e); }
            return false;
        }

        var startPunct = new RegExp("^([\?\.\!]\\s*)");    
        var endPunct = new RegExp("[\?\.\!](\\s+\\S)$");
        function selection2statement(selection_range) {
            var statement_range = selection_range.cloneRange();
            
            while (statement_range.startOffset > 0) {
                var end_of_last_sentence = startPunct.exec(statement_range.toString());
                if (end_of_last_sentence != null) {
                    statement_range.setStart(statement_range.startContainer, statement_range.startOffset + end_of_last_sentence[1].length);
                    break;
                }   
                statement_range.setStart(statement_range.startContainer, statement_range.startOffset - 1); 
            }   
                
            while (statement_range.endOffset < statement_range.endContainer.length) {
                var beginning_of_next_sentence = endPunct.exec(statement_range.toString());
                if( beginning_of_next_sentence != null ) { 
                    statement_range.setEnd(statement_range.endContainer, statement_range.endOffset - beginning_of_next_sentence[1].length);
                    break;
                }   
                statement_range.setEnd(statement_range.endContainer, statement_range.endOffset + 1); 
            }   
            
            //statement_range.setStart(statement_range.startContainer, statement_range.startOffset - 1);
            //statement_range.setEnd(statement_range.endContainer, statement_range.endOffset + 1);
            return statement_range;
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
    p += '    <div style="position:fixed; top:64px; right:32px; width:30%; height:90%; z-index:999999; opacity:.70" id="flinkt.org status">'
    p += '    </div>'
    return p

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
                <li><a href="http://techcrunch.com/2008/10/16/fleck-headed-to-the-deadpool-because-nobody-wants-to-annotate-the-web/">article on fleck's demise</a>
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
        '''
    r = http.HttpResponse(p)
    return r

# old junk from the examples

def hello_html(request):
    "This view is a basic 'hello world' example in HTML."
    return HttpResponse('<h1>Hello, world.</h1>')

def hello_text(request):
    "This view is a basic 'hello world' example in plain text."
    return HttpResponse('Hello, world.', mimetype='text/plain')

def hello_write(request):
    "This view demonstrates how an HttpResponse object has a write() method."
    r = HttpResponse()
    r.write("<p>Here's a paragraph.</p>")
    r.write("<p>Here's another paragraph.</p>")
    return r

def metadata(request):
    "This view demonstrates how to retrieve request metadata, such as HTTP headers."
    r = HttpResponse('<h1>All about you</h1>')
    r.write("<p>Here's all known metadata about your request, according to <code>request.META</code>:</p>")
    r.write('<table>')
    meta_items = request.META.items()
    meta_items.sort()
    for k, v in meta_items:
        r.write('<tr><th>%s</th><td>%r</td></tr>' % (k, v))
    r.write('</table>')
    return r

def get_data(request):
    "This view demonstrates how to retrieve GET data."
    r = HttpResponse()
    if request.GET:
        r.write('<p>GET data found! Here it is:</p>')
        r.write('<ul>%s</ul>' % ''.join(['<li><strong>%s:</strong> %r</li>' % (escape(k), escape(v)) for k, v in request.GET.items()]))
    r.write('<form action="" method="get">')
    r.write('<p>First name: <input type="text" name="first_name"></p>')
    r.write('<p>Last name: <input type="text" name="last_name"></p>')
    r.write('<p><input type="submit" value="Submit"></p>')
    r.write('</form>')
    return r

def post_data(request):
    "This view demonstrates how to retrieve POST data."
    r = HttpResponse()
    if request.POST:
        r.write('<p>POST data found! Here it is:</p>')
        r.write('<ul>%s</ul>' % ''.join(['<li><strong>%s:</strong> %r</li>' % (escape(k), escape(v)) for k, v in request.POST.items()]))
    r.write('<form action="" method="post">')
    r.write('<p>First name: <input type="text" name="first_name"></p>')
    r.write('<p>Last name: <input type="text" name="last_name"></p>')
    r.write('<p><input type="submit" value="Submit"></p>')
    r.write('</form>')
    return r

