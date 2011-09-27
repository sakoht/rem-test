# Create your views here.
from django import http
from django.http import HttpResponse
from django.utils.html import escape
import pprint

def under_construction(request):
    r = http.HttpResponse('This site is under construction.  Come back soon...')
    return r

def main(request):
    r = http.HttpResponse('<h1>vootr</h1>')
    r.write('<ol>')
    r.write('<li><a href="' + bookmarklet_text() + '">vootr</a>   <==========   drag this link onto your bookmarks bar!</li>')
    r.write('<li>go to any web site</li>')
    r.write('<li>click the bookmark to turn on the vootr pen ...it appears on the right</li>')
    r.write('<li>click on any statement to highlight it</li>')
    r.write('<li>hover over the highlighted statement to see options like email, digg, facebook, google+, and twitter</li>')
    r.write('<li>turn the pen on and off whenever you want by clicking on the image on the right</li>')
    r.write('<li>when you come back to the site, turn on the pen again to see your previous highlights</li>')
    r.write('<li>click on the green arrow to see all of your highlights, see a capture of the page, and send them around</li>')
    r.write('</ol>')
    return r

def bookmarklet_text():
    b = "javascript:(function(){"
    b += "  if(document.getElementById('factmap.org bookmarklet') == null) {"
    b += "    s=document.createElement('script');"
    b += "    s.setAttribute('type','text/javascript');"
    b += "    s.setAttribute('charset','UTF-8');"
    b += "    s.setAttribute('src','http://factmap.org/js/selector.js');"
    b += "    s.setAttribute('id','factmap.org bookmarklet');"
    b += "    document.body.appendChild(s);"
    b += "  }"
    b += "})();"
    return b

def selector_js(request):
    r = http.HttpResponse('',mimetype='text/javascript')

    #r.write("alert('injecting pen')\n")
    r.write("p = document.createElement('div');\n")
    r.write("p.setAttribute('id','factmap.org app')\n")
    #r.write("p.setAttribute('style','position:fixed; right:32px; top:32px;');\n")
    r.write("p.innerHTML = '" + pen_div_html() + "';\n")
    r.write("document.body.appendChild(p);\n")

    s = '''
        var pen_status = 'off'

        function pen_on() {
            document.getElementById('factmap.org pen on').style.zIndex = 9998;
            document.getElementById('factmap.org pen off').style.zIndex = 9997;
            document.addEventListener('mouseup', on_mouseup, true);
            pen_status = 'on';
        }

        function pen_off() {
            document.getElementById('factmap.org pen on').style.zIndex = 9997;
            document.getElementById('factmap.org pen off').style.zIndex = 9998;
            document.removeEventListener('mouseup',on_mouseup, true);
            pen_status = 'off';
        }

        function close_click() {
            var a = document.getElementById('factmap.org app');
            var b = document.getElementById('factmap.org bookmarklet');
            if (a != null) { a.parentNode.removeChild(a); }
            if (b != null) { b.parentNode.removeChild(b); }
        }

        function site_click() {
            alert('site click');
        }

        function on_mouseup() {
            if (pen_status == 'on') {
                alert('snap');
            }
            else {
                alert('nope');
            }
        }

        pen_on()
    '''

    r.write(s);
    #r.write("alert('pen injected')\n")
    return r

def pen_div_html():
    p =  '    <div style="position:fixed; top:32px; right:32px; z-index:9997;" id="factmap.org pen off">'
    p += '      <img onclick="pen_on()" src="http://www.factmap.org/images/pen32right.jpg">'
    p += '    </div>'
    p += '   <div style="position:fixed; top:32px; right:32px; z-index:9998;" id="factmap.org pen on">'
    p += '      <img onclick="pen_off()" src="http://www.factmap.org/images/pen32left.jpg">'
    p += '    </div>'
    p += '    <div style="position:fixed; top:32px; right:20px; z-index:9999;">'
    p += '      <img onclick="close_click()" src="http://www.factmap.org/images/x12.jpg">'
    p += '    </div>'
    p += '    <div style="position:fixed; top:44px; right:20px; z-index:9999;">'
    p += '      <img onclick="site_click()" src="http://www.factmap.org/images/right20.jpg">'
    p += '    </div>'
    return p

# old junk from the examples

def index(request):
    r = http.HttpResponse('<h1>FactMap Entry<h1><ul>')
    r.write('<li><a href="examples/">Hello</a></li>')
    r.write('<li><a href="selector/">Selector</a></li>')
    r.write('<li><a href="summarize/">Summarize</a></li>')
    r.write('</ul>')
    return r

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

