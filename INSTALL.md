Installation
============

# install couchdb
# (instructions from http://docs.couchdb.org/en/latest/install/mac.html)
brew install autoconf
brew install autoconf-archive
brew install automake
brew install libtool
brew install erlang
brew install icu4c
brew install spidermonkey
brew install curl
brew link icu4c
brew link erlang --no-docs
brew install couchdb

# setup couchdb admin
# (it will rewrite you password as a hash later)
# (use a real username and password her, and below)
echo "myuser = mypassword" >> /usr/local/etc/couchdb/local.ini

# start couchdb in a way that will keep it running 
launchctl load  /usr/local/Cellar/couchdb/1.5.0/homebrew.mxcl.couchdb.plist

    # NOTE: to later unload from launchctl: 
    launchctl unload  /usr/local/Cellar/couchdb/1.5.0/homebrew.mxcl.couchdb.plist

    # NOTE: to run directly instead of by launchctl
    couchdb

    # NOTE: to kill a directly running couchdb, ctrl-c
    # and if necessary kill running daemsons by finding the PID with
    lsof -i tcp:5984 | grep LISTEN

# verify that the server is running
open http://localhost:5984/_utils/

# verify that your password is now safely hidden as a hash
tail /usr/local/etc/couchdb/local.ini

# install couchapp
git submodule update
cd couchapp; python setup.py install; cd ..

# do a one-time deploy of the couchdb-xd database and app
cd couchdb-xd
couchapp push http://myuser:mypassword@localhost:5984/couchdb-xd
cd ..

# ensure it appears in your database list
open http://localhost:5984/_utils/

# deploy the rememberthis webclient
cd webclient
couchapp push http://mysuser:mypassword@localhost:5984/flinktdb
cd ..

