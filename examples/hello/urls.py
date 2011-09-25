from django.conf.urls.defaults import *

urlpatterns = patterns('examples.hello.views',
    (r'^$', 'index'),
    (r'^hello/html/$', 'hello_html'),
    (r'^hello/text/$', 'hello_text'),
    (r'^hello/write/$', 'hello_write'),
    (r'^hello/metadata/$', 'metadata'),
    (r'^hello/getdata/$', 'get_data'),
    (r'^hello/postdata/$', 'post_data'),
)
