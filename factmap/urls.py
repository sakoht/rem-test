from django.conf.urls.defaults import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Example:
    (r'^$',                         'factmap.views.under_construction'),
    (r'^demo$',                     'factmap.views.main'),
    (r'^testo$',                    'factmap.views.testo'),
    (r'^faq$',                      'factmap.views.faq'),
    (r'^js/selector.js',            'factmap.views.selector_js'),
    (r'^static/(?P<path>.*)$',      'django.views.static.serve',
                                        {'document_root': '/var/www/www.flinkt.org/static/'}),
    (r'^js/(?P<path>.*)$',          'django.views.static.serve',
                                        {'document_root': '/var/www/www.flinkt.org/js/'}),

    # Uncomment the admin/doc line below and add 'django.contrib.admindocs' 
    # to INSTALLED_APPS to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    #(r'^admin/', include(admin.site.urls)),
    
    #(r'^examples/$', 'examples.views.index'),
    (r'^djexamples/', include('examples.hello.urls')),

    (r'^.*', 'factmap.views.under_construction'),
)
