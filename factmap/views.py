from django import http
from django.http import HttpResponse
from django.utils.html import escape
import pprint
import datetime
import time
import re
from hashlib import sha1
from uuid import uuid1

# ^$
def under_construction(request):
    r = http.HttpResponse('This site is under construction.  Come back soon...')
    return r

# ^demo$
def main(request):
    r = http.HttpResponse()
    #r.write('<head><script src="/_utils/script/jquery.couch.js"></script><script src="/_utils/script/jquery.js"></script></head><body>');
    #r.write('<head><script src="/static/js//jq.js"></script></head><body>');
    r.write('<h1>flinkt</h1>')
    r.write('<ol>')
    r.write('<li><a href="' + bookmarklet_text('') + '">flinkt</a>   <==========   drag this link onto your bookmarks bar!</li>')
    r.write('<li>go to any web site (or stay right here to try it)</li>')
    r.write('<li>click the bookmark to turn on the flinkt pen ...it appears on the right</li>')
    r.write('<li>select any statement to highlight it</li>')
    r.write('<li>click any highlighted statement to see options like email, digg, facebook, google+, and twitter (NOT IMPLEMENTED)</li>')
    r.write('<li>turn the pen on and off whenever you want by clicking on the image on the right (NOT IMPEMENTED)</li>')
    r.write('<li>when you come back to the site, turn on the pen again to see your previous highlights (NOT IMPLEMENTED)</li>')
    r.write('<li>click on the green arrow to see all of your highlights, see a capture of the page, and send them around (NOT IMPLEMENTED)</li>')
    r.write('</ol>')
    return r

p = re.compile('^/noajax/([^/]+)/(.*)')
def noajax(request):
    r = http.HttpResponse()
    m = match(request.path)
    if (not m):
        r.write("alert('bad path: " + request.path  + "')")
    else:
        jsid = m.group(1)
        path = m.group(2)
        j = 'document.response.push({ "path": "' + path + '", "date": "' + str(datetime.datetime.now()) + '" });'
        j += "\nvar js = document.getElementById('" + jsid + "'); js.parentElement.removeChild(js);"
        time.sleep(10);
        r.write(j)
    return r    


def jsonobj(request):
    #jsid = request.REQUEST['jsid'];

    j = '{ testid: "' + str(uuid1()) + '", date: "' + str(datetime.datetime.now()) + '" }'
    j = 'var d = { foo: 111, bar: 222 }'
    #j = 'document.response.push({ "testid": "' + str(uuid1()) + '", "date": "' + str(datetime.datetime.now()) + '" });'
    #j += "\nvar js = document.getElementById('" + jsid + "'); js.parentElement.removeChild(js);"
    r = http.HttpResponse(j, mimetype='text/javascript')
    #time.sleep(10);
    return r    

def bookmarklet_text(flinkt_id_str):
    if (flinkt_id_str == ''):
        flinkt_id = uuid1()
        flinkt_id_str = str(flinkt_id)

    b = "javascript:(function(){"
    b += "  if(document.getElementById('flinkt.org bookmarklet') == null) {"
    b += "    s=document.createElement('script');"
    b += "    s.flinkt_init_bookmarklet_id = '" + flinkt_id_str + "';"
    b += "    s.flinkt_init_session_id = Date();" 
    b += "    s.setAttribute('type','text/javascript');"
    b += "    s.setAttribute('charset','UTF-8');"
    b += "    s.setAttribute('src','http://www.flinkt.org/static/js/selector.js?id=" + flinkt_id_str + "&date=' + s.flinkt_init_session_id);"
    b += "    s.setAttribute('id','flinkt.org bookmarklet');"
    b += "    document.body.appendChild(s);"
    b += "  }"
    b += "})();"
    return b


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
    p += '    <div style="position:fixed; top:64px; right:32px; width:30%; height:90%; z-index:999999; opacity:.70" id="flinkt.org status">HI'
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
        More importantly, <a href="http://www.flinkt.org/demo">flinkt</a> remembers the line, the page, and the context for you, so you can later get back to things you read.
        The flinkt site gives you your own private database, for keeping your thoughts organized ...without making you do a lot of work to organize them.
        <p>
        <img src="/images/pen32left.jpg" href="http://www.flinkt.org/faq">
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

# the old version made the js dynamically, just give an error if we go to this URL
def selector_js(request):
    return http.HttpResponse('alert("Your test bookmarklet needs to be replaced!\\n\\nPlease go to flinkt.org/demo to get the latest one.");')
    #return http.HttpResponse('alert("Your test bookmarklet needs to be replaced!\\n\\nPlease go to flinkt.org/demo to get the latest one."); function removeme() { document.documentElement.removeChild(document.getElementById("flinkt.org bookmarklet")); }; setTimeout(removeme,3000); ')

