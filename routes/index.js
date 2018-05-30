"use strict";
var db = require('../db');
var env = require('../private')

// GET /
exports.index = function (req, res) {
    var query = "SELECT * FROM Posts P ORDER BY P.pid DESC";

    // Do something here 

    db.query(query, function (recordset) {
        res.render('index', {
            rows: recordset,
            auth: typeof req.sessions.user !== 'undefined',
            god: req.sessions.privilege === 'god'
        });
    });
};

// Haven't implemented this on the UI side yet.
// exports.index_filter = function (req, res) {
//     var query = "SELECT P.pid, P.title, P.tags, P.topic, P.body_preview FROM Posts P WHERE P.topic=@topic ORDER BY P.pid DESC";

//     var request = new req.sql.Request();
//     request.input('topic', req.params.filter);

//     request.query(query, function (err, recordset) {
//         if (err) throw err;

//         res.render('index', {
//             rows: recordset,
//             auth: typeof req.sessions.user !== 'undefined',
//             god: req.sessions.privilege === 'god'
//         });
//     });
// };

// GET /posts/5
exports.post = function (req, res) {
    var query = "SELECT * FROM Posts P WHERE P.friendly_url = @url";

    db.query(query, function (recordset) {
        if (recordset.length == 0) { // Bad URL or still using PID not friendly_url, check for pid
            var query = "SELECT * FROM Posts P WHERE P.pid = @pid";

            db.query(query, function(recordset) {
                if (recordset.length == 0) {
                    // Really not found
                    res.render('errors/notfound');
                } else {
                    res.redirect('/posts/' + recordset[0].friendly_url); 
                }
            }, { 'pid': req.params.friendly_url });

        } else { // Found it
            recordset[0].body_markdown = req.md.render(recordset[0].body_markdown);

            // Render post with auth / privilege level
            res.render('posts/post', {
                title: recordset[0].title,
                row: recordset[0],
                auth: typeof req.sessions.user !== 'undefined',
                god: req.sessions.privilege == 'god'
            });
        }
    }, { 'url': req.params.friendly_url });
}

// GET /login
exports.g_login = function (req, res) {
    res.render('auth/login');
}

// GET /register
exports.g_register = function (req, res) {
    res.render('auth/register');
}

// GET /create
exports.g_create = function (req, res) {
    if (req.sessions.user && req.sessions.privilege == "god") {
        res.render('admin/create');
    } else {
        res.render('errors/notfound');
    }
}

// GET /edit/5
// TODO find a way to make the default <select> value set right here
exports.g_edit = function (req, res) {
    // Check auth
    if (!req.sessions.user || req.sessions.privilege != 'god') {
        res.render('errors/notfound');
    }

    var query = "SELECT * FROM Posts P WHERE P.pid=@pid";

    db.query(query, function (recordset) {
        if (recordset.length == 0) { // Bad ID, can't find post
            res.render('errors/notfound');
        } else if (recordset.length == 1) { // Post found
            res.render('admin/edit', { row: recordset[0] });
        } else { // You've broken spacetime
            res.render('errors/servererror');
        }
    }, { 'pid': req.params.pid });
}

// POST /edit/5
exports.p_edit = function (req, res) {
    if (!req.sessions.user || req.sessions.privilege != 'god') {
        res.render('errors/notfound');
    }

    var query = "UPDATE Posts SET title=@title, tags=@tags, topic=@topic, body_preview=@preview, body_markdown=@markdown WHERE pid=@pid";

    db.query(query, function (recordset) {
        res.redirect('/');
    },
    {
        'pid': req.params.pid,
        'title': req.body.title,
        'tags': req.body.tags,
        'topic': req.body.topic,
        'preview': req.body.preview,
        'markdown': req.body.markdown,
    })

    validateAndUploadFiles(req.files.photos, req.fs);
}

// POST /login
exports.p_login = function (req, res) {
    var query = "SELECT * FROM Users U WHERE U.username=@username";

    db.query(query, function (recordset) {
        if (recordset.length == 0) {
            // user not found
            res.redirect('/register');
        } else if (recordset.length == 1) {
            // found user, authenticate
            if (req.bcrypt.compareSync(req.body.password, recordset[0].password)) {
                // successful login, setup session
                req.sessions.user = req.body.username;
                req.sessions.privilege = recordset[0].privilege;
                res.redirect('/');
            } else {
                // wrong password
                res.render('auth/login', { error: "Incorrect password or username" });
            }
        } else {
            //breaking the universe
            res.render('errors/servererror');
        }
        // unreachable code?
        res.render('errors/servererror');
    }, { 'username': req.body.username });
}

// POST /logout
exports.logout = function (req, res) {
    delete req.sessions.user;
    delete req.sessions.privilege;
    res.redirect('/');
}

// Converted to mssql
// exports.p_register = function (req, res) {
//     var query = "INSERT INTO Users (username, password, privilege) VALUES (@username, @password, @privilege)";

//     var request = new req.sql.Request();
// var privilege = req.body.username == env.authName ? "god" : "user";

//     request.input('username', req.body.username);
//     request.input('password', req.bcrypt.hashSync(req.body.password));
//     request.input('privilege', privilege);

//     request.query(query, function (err, recordset) {
//         res.redirect('/');
//     });
// }

// POST /delete
exports.delete = function (req, res) {
    if (!req.sessions.user || req.sessions.privilege != 'god') {
        res.render('errors/notfound');
    }

    var query = "DELETE FROM Posts WHERE pid=@pid";

    db.query(query, function (recordset) {
        res.redirect('/');
    }, { 'pid': req.params.pid });
}

// POST /create
exports.p_create = function (req, res) {
    if (!req.sessions.user || req.sessions.privilege != 'god') {
        res.render('errors/notfound');
    }

    // MSSQL module takes care of sanitizing using @param in query string        
    var query = "INSERT INTO Posts (title, tags, topic, friendly_url, body_preview, body_markdown, date_time) VALUES (@title, @tags, @topic, @url, @preview, @markdown, @date)";
    var d = new Date();

    db.query(query, function(recordset) {
        res.redirect('/');        
    },
    {
        'title': req.body.title,
        'tags': req.body.tags,
        'topic': req.body.topic,
        'url': req.body.url,
        'preview': req.body.preview,
        'markdown': req.body.markdown,
        'date': (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear()
    });

    validateAndUploadFiles(req.files.photos, req.fs);    
}

// Handle case for one and multiple file uploads and validation
function validateAndUploadFiles(files, fs) {
    // one file
    if (typeof files.length == "undefined" && files.size != 0) {
        upload(files, fs);
    } else { // multiple files
        for (var i = 0; i < files.length; i++) {
            (function (i) { // Love using IIFEs
                upload(files[i], fs);
            })(i);
        }
    }
}

// Upload a single file to /uploads
function upload(file, fs) {
    fs.readFile(file.path, function (err, data) {
        if (err) throw err;

        var newPath = __dirname + "/../public/uploads/" + file.name;

        fs.writeFile(newPath, data, function (err) {
            if (err) throw err;
        });
    });
}