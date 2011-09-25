from django.conf.urls.defaults import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Example:
    (r'^$', 'factmap.views.index'),

    (r'^selector/$', 'factmap.selector.views.index'),
    (r'^selector/.*', include('selector.urls')),

    (r'^summarize/', 'factmap.summarize.views.index'),
    # Uncomment the admin/doc line below and add 'django.contrib.admindocs' 
    # to INSTALLED_APPS to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    #(r'^admin/', include(admin.site.urls)),
    
    #(r'^examples/$', 'examples.views.index'),
    (r'^examples/', include('examples.hello.urls')),
)
