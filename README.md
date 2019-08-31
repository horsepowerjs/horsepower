## Table of contents

* [Installation](#installation) &ndash; Installing the horsepower http server
* [Server setup](#server-setup) &ndash; Setting up a proxy server
  * [Nginx](#nginx) &ndash; Setting up Nginx as a proxy server
  * [Apache](#apache) &ndash; Setting up Apache as a proxy server

## Installation

It is recommended that you install the server via `@horsepower/cli`. This will download the repository, install the node modules, and make all necessary adjustments.


```bash
npm i -g @horsepower/cli

cd ./Documents/www
hp new <website-name>

node ./<website-name>/index.js
```

You can now access the server by going to http://127.0.0.1:5000 and you should be welcomed with a welcome page.

## Server setup

You probably want to setup your server so that when people visit your website they don't have to put an ip and port into their browser but instead an actual domain.

These configurations use a proxy to listen to the port that the server is running on. Using a process manager is okay and recommended in order to keep your website up and running if you've run into some bad code that crashes the server.

Based on the type of server you are using or want to use the configuration for each of these will look slightly different.

### Nginx

Nginx is a fast lightweight server that is easy to use on linux servers.

First you will want to install and create a new configuration file:

```bash
# Install nginx if it hasn't already been installed
sudo apt install nginx

# Create a new configuration file
vim /etc/nginx/sites-available/example.com
```

Within the configuration file add the following content, replacing `example.com` with your domain name and `5000` with the actual port that you are running the server on.

```conf
server {
  # Setup the domain name(s)
  server_name example.com;
  listen 80;

  # Setup the proxy
  # This will forward all requests to the horsepower http server
  # and then it will relay the servers response back to the client
  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }
}
```

We will want to create a symbolic link to this file so that we can enable/disable this domain without deleting the file itself, and just add/remove the symbolic link.

```bash
# CD to nginx "sites-enabled" directory
cd /etc/nginx/sites-enabled

# Create the symbolic link
ln -s ../sites-available/example.com ./example.com
```

Finally we start both of the services and test the domain (assuming it has already propagated).

```bash
# Start the horsepower http server
pm2 start ./ecosystem.config.js

# Start the nginx service
sudo service nginx start
```

### Apache

Apache is a popular server that works well on all platforms though it isn't lightweight like Nginx.

First we will start by installing apache if it hasn't already been installed, then we will create the configuration file.

```bash
# Install apache if it hasn't already been installed
sudo apt install apache2

vim /etc/apache2/sites-available/example.conf
```

So first we create a new virtual host, replacing `example.com` with your domain name and `5000` with the actual port that you are running the server on.

```conf
<VirtualHost *:80>
  ServerName example.com

  ProxyPass http://127.0.0.1:5000

  ProxyPreserveHost On
</VirtualHost>
```

You must also have the modules enabled within the master apache config file:

```conf
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
```

Finally we start both of the services and test the domain (assuming it has already propagated).

```bash
# Start the horsepower http server
pm2 start ./ecosystem.config.js

# Start the apache service
sudo service apache2 start
```
