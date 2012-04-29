sudo apt-get update
sudo apt-get install couchdb 
sudo mv /etc/couchdb/local.ini{,.bak}
sudo cp etc-couchdb/local.ini /etc/couchdb/local.ini
sudo /etc/init.d/couchdb restart
sudo apt-get install curl 
sudo apt-get install python-setuptools python-pip python-dev build-essential


