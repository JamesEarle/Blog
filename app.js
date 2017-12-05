"use strict";

var sessions = require("client-sessions");
var bcrypt = require("bcrypt-nodejs");
var md = require('markdown-it')();
var body = require('body-parser');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');

var highlight = require('highlight').Highlight;

var app = express();

// Allow requests to parse request body info
app.use(express.bodyParser());

// Make necessary parameters visible to 
app.use(function (req, res, next) {
    // req.connection = connection;
    req.highlight = highlight;
    req.sessions = sessions;
    req.bcrypt = bcrypt;
    req.md = md;
    req.fs = fs;
    next();
});


// all environments
app.set('port', process.env.PORT || 443);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// GET Routes
app.get('/', routes.index);
// app.get('/filter/:filter', routes.index_filter);
app.get('/login', routes.g_login);
// app.get('/register', routes.g_register);
app.get('/logout', routes.logout);

// Static pages
app.get('/about', routes.about);

// Safety nets
app.get('/posts/', routes.index);
app.get('/posts', routes.index);
app.get('/edit/', routes.index);
app.get('/edit', routes.index);
app.get('/delete/', routes.index);
app.get('/delete', routes.index);

// POST Routes
app.post('/login', routes.p_login);
// app.post('/register', routes.p_register);

// Create
app.get('/create', routes.g_create);
app.post('/create', routes.p_create);

// Read
app.get('/posts/:friendly_url', routes.post);

// Update
app.get('/edit/:pid', routes.g_edit);
app.post('/edit/:pid', routes.p_edit);

// Delete
app.post('/delete/:pid', routes.delete);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});