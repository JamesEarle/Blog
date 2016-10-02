var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var marked = require('marked');

// MySQL DB connection and setup.
var mysql = require("mysql");

var connection = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "", //secret
    database : "blog",
    port : "3306"
});

connection.connect();

var app = express();

// Make the DB and Markdown parser visible to the router
app.use(function (req, res, next) {
    req.connection = connection;
    req.marked = marked;
    next();
});

// all environments
app.set('port', process.env.PORT || 3000);
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
app.get('/login', routes.g_login);
app.get('/register', routes.g_register);
app.get('/posts/:pid', routes.posts);

// POST Routes
app.post('/login', routes.p_login);
app.post('/register', routes.p_register);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
