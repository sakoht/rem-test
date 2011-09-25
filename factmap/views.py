# Create your views here.
from django import http
from django.http import HttpResponse
from django.utils.html import escape
import pprint

def main(request):
    r = http.HttpResponse('<h1>FactMap</h1>')
    r.write('<ul>');
    r.write('<li>one</li>');
    r.write('<li>two</li>');
    r.write('<li>three</li>');
    r.write('<a href="' + bookmarklet_text() + '">Selector</a>');
    r.write('</ul>');
    return r

def bookmarklet_text():
    b = "javascript:(function(){"
    b = b + "s=document.createElement('script');"
    b = b + "s.setAttribute('type','text/javascript');"
    b = b + "s.setAttribute('charset','UTF-8');"
    b = b + "s.setAttribute('src','http://factmap.org/selector');"
    b = b + "document.body.appendChild(s);"
    b = b + "})();"
    return b

def selector(request):
    r = http.HttpResponse('alert("begin");',mimetype='text/javascript')
    r.write('alert("end")');
    return r

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

