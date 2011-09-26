# Create your views here.
from django import http
from django.http import HttpResponse
from django.utils.html import escape
import pprint

def main(request):
    r = http.HttpResponse('<h1>FactMap</h1>')
    r.write('<ul>');
    r.write('<li>select statements anywhere on the web</li>');
    r.write('<li>remember everything you select</li>');
    r.write('<li>mail web pages with your selection highlighted</li>');
    r.write('<a href="' + bookmarklet_text() + '">Selector</a> <== drag this onto your bookmarks bar to use it anywhere!');
    r.write('</ul>');
    return r

def bookmarklet_text():
    b = "javascript:(function(){"
    b += "s=document.createElement('script');"
    b += "s.setAttribute('type','text/javascript');"
    b += "s.setAttribute('charset','UTF-8');"
    b += "s.setAttribute('src','http://factmap.org/js/selector.js');"
    b += "document.body.appendChild(s);"
    b += "})();"
    return b

def selector_js(request):
    r = http.HttpResponse('',mimetype='text/javascript')
    #r.write("alert('injecting pen')\n")
    r.write("if(document.getElementById('factmap.org pen') == null) {\n")
    r.write("  p = document.createElement('div');\n")
    r.write("  p.setAttribute('id','factmap.org pen')\n")
    #r.write("  p.setAttribute('style','position:fixed; right:32px; top:32px;');\n")
    r.write("  p.innerHTML = '" + pen_div_html() + "';\n")
    r.write("  document.body.appendChild(p);\n")
    r.write("}\n");
    #r.write("alert('pen injected')\n")
    return r

def pen_div_html():
    p =  '    <div style="position:fixed; top:32px; right:32px; z-index:100;">'
    p += '      <img src="http://www.factmap.org/images/pen32lr.jpg">'
    p += '    </div>'
    p += '    <div style="position:fixed; top:32px; right:20px; z-index:101;">'
    p += '      <img src="http://www.factmap.org/images/x12.jpg">'
    p += '    </div>'
    p += '    <div style="position:fixed; top:44px; right:20px; z-index:101;">'
    p += '      <img src="http://www.factmap.org/images/right20.jpg">'
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

