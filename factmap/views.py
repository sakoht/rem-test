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
    r = http.HttpResponse('<h1>flinkt</h1>')
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
    return r

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
    r.write("document.body.appendChild(p);\n")

    s = '''
        var pen_status = 'off'

        function pen_on() {
            document.getElementById('flinkt.org pen on').style.zIndex = 999998;
            document.getElementById('flinkt.org pen off').style.zIndex = 999996;
            document.addEventListener('click',on_click, true);
            document.addEventListener('touchend',on_touchend, true);
            document.addEventListener('touchmove',on_touchmove, true);
            pen_status = 'on';
        }

        function pen_off() {
            document.getElementById('flinkt.org pen off').style.zIndex = 99998;
            document.getElementById('flinkt.org pen on').style.zIndex = 99997;
            document.removeEventListener('click',on_click, true);
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

        var select_count = 0;

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
            var obj = (event.changedTouches.length ? event.changedTouches[0].target : null);
            if (obj == null) {
                alert(event.touches.length + ' ' + event.changedTouches.length + ' ' + event.targetTouches.length);
                return;
            }
            else {
                statement_select(obj);
            }
        }
            
        function on_click() {
            statement_select(event.srcElement);
        }

        function statement_select(obj) {
            if (obj != null && obj.tagName == 'IMG') {
                alert('image');
                return;
            }
            if (pen_status != 'on') {
                alert('the selection event occurred with the pen off?');
                return;
            }
            select_count++;
            document.flink_last_event = event;
            document.flink_last_obj = obj;
            document.getElementById('flinkt.org status').innerHTML = select_count + '<br><pre>' + mydump(obj) + '</pre>';
        }

        // from stackoverflow:
        // http://stackoverflow.com/questions/749266/object-dump-javascript
        function mydump(arr,level) {
            var dumped_text = "";
            //return dumped_text;
            if(!level) level = 0;
            
            var level_padding = "";
            for(var j=0;j<level+1;j++) level_padding += "    ";

            if(typeof(arr) == 'object' && arr != null && arr.tagName != 'IMG') {  
                for(var item in arr) {
                    var value = arr[item];

                    if(typeof(value) == 'object') { 
                        dumped_text += level_padding + "'" + item + "' => \\"" + typeof(value) + "\\"\\n";
                        //dumped_text += level_padding + "'" + item + "' ...\\n";
                        //dumped_text += (level <= 0 ? mydump(value,level+1) : "");
                    } else {
                        dumped_text += level_padding + "'" + item + "' => \\"" + value + "\\"\\n";
                    }
                }
            } else { 
                dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
            }
            return dumped_text;
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
    p += '    <div style="position:fixed; top:32px; right:20px; z-index:999999;">'
    p += '      <img onclick="close_click()" src="http://www.flinkt.org/images/x12.jpg">'
    p += '    </div>'
    p += '    <div style="position:fixed; top:44px; right:20px; z-index:999999;">'
    p += '      <img onclick="site_click()" src="http://www.flinkt.org/images/right20.jpg">'
    p += '    </div>'
    #p += '    <div style="position:fixed; top:64px; right:32px; width:20%; height:80%; z-index:999999;" id="flinkt.org status">'
    p += '    <div z-index:999999;" id="flinkt.org status">'
    p += '    </div>'
    return p

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

