"use strict";

/* GET */

// Converted
exports.index = function (req, res) {
    var query = "SELECT * FROM Posts P ORDER BY P.pid DESC";

    new req.sql.Request().query(query, function (err, recordset) {
        if (err) throw err;

        var val = recordset;

        res.render('index', {
            rows: recordset,
            auth: typeof req.sessions.user !== 'undefined',
            god: req.sessions.privilege === 'god'
        });
    });
};

// This is likely to get overridden by the jQuery Isotope extension
exports.index_filter = function (req, res) {
    var query = "SELECT P.pid, P.title, P.tags, P.topic, P.body_preview FROM Posts P WHERE P.topic=@topic ORDER BY P.pid DESC";

    var request = new req.sql.Request();
    request.input('topic', req.params.filter);

    request.query(query, function (err, recordset) {
        if (err) throw err;

        res.render('index', {
            rows: recordset,
            auth: typeof req.sessions.user !== 'undefined',
            god: req.sessions.privilege === 'god'
        });
    });
};

// View specific post
exports.post = function (req, res) {
    var query = "SELECT * FROM Posts P WHERE P.pid=@pid";
    var request = new req.sql.Request();

    // Register inputs, sanitization handled by mssql and @param syntax
    request.input('pid', req.params.pid);

    request.query(query, function (err, recordset) {
        if (err) throw err;

        if (recordset.length == 0) { // Bad ID
            res.render('errors/notfound');
        } else if (recordset.length == 1) { // Found it
            recordset[0].body_markdown = req.md.render(recordset[0].body_markdown);

            // Render post with auth / privilege level
            res.render('posts/post', {
                row: recordset[0],
                auth: typeof req.sessions.user !== 'undefined',
                god: req.sessions.privilege == 'god'
            });
        } else { // Creating a black hole
            res.render('errors/servererror');
        }
    });
}

exports.g_login = function (req, res) {
    res.render('auth/login');
}

exports.g_register = function (req, res) {
    res.render('auth/register');
}

exports.g_create = function (req, res) {
    if (req.sessions.user && req.sessions.privilege == "god") {
        res.render('admin/create');
    } else {
        res.render('errors/notfound');
    }
}

// TODO find a way to make the default <select> value set right here
exports.g_edit = function (req, res) {
    // Check auth
    if (!req.sessions.user || req.sessions.privilege != 'god') {
        res.render('errors/notfound');
    }

    var query = "SELECT * FROM Posts P WHERE P.pid=@pid";
    var request = new req.sql.Request();

    request.input('pid', req.params.pid);

    request.query(query, function (err, recordset) {
        if (err) throw err;

        if (recordset.length == 0) { // Bad ID, can't find post
            res.render('errors/notfound');
        } else if (recordset.length == 1) { // Post found
            res.render('admin/edit', { row: recordset[0] });
        } else { // You've broken spacetime
            res.render('errors/servererror');
        }
    });
}

/* POST */
exports.p_edit = function (req, res) {
    if (!req.sessions.user || req.sessions.privilege != 'god') {
        res.render('errors/notfound');
    }

    var query = "UPDATE Posts SET title=@title, tags=@tags, topic=@topic, body_preview=@preview, body_markdown=@markdown WHERE pid=@pid";
    var request = new req.sql.Request();

    // Register inputs to update
    request.input('pid', req.params.pid);
    request.input('title', req.body.title);
    request.input('tags', req.body.tags);
    request.input('topic', req.body.topic);
    request.input('preview', req.body.preview);
    request.input('markdown', req.body.markdown);

    // Check and upload files (if any exist)
    validateAndUploadFiles(req.files.photos, req.fs);

    request.query(query, function (err, recordset) {
        if (err) throw err;
        res.redirect('/');
    });
}

exports.p_login = function (req, res) {
    var query = "SELECT * FROM Users U WHERE U.username=@username";

    var request = new req.sql.Request();

    request.input('username', req.body.username);

    request.query(query, function (err, recordset) {
        if (err) throw err;

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
    });
}

exports.logout = function (req, res) {
    delete req.sessions.user;
    delete req.sessions.privilege;
    res.redirect('/');
}

// Converted to mssql
exports.p_register = function (req, res) {
    var query = "INSERT INTO Users (username, password, privilege) VALUES (@username, @password, @privilege)";

    var request = new req.sql.Request();
    var privilege = req.body.username == "jamesearle" ? "god" : "user";

    request.input('username', req.body.username);
    request.input('password', req.bcrypt.hashSync(req.body.password));
    request.input('privilege', privilege);

    request.query(query, function (err, recordset) {
        res.redirect('/');
    });
}

exports.delete = function (req, res) {
    if (!req.sessions.user || req.sessions.privilege != 'god') {
        res.render('errors/notfound');
    }

    var query = "DELETE FROM Posts WHERE pid=@pid";
    var request = new req.sql.Request();

    // Register inputs
    request.input('pid', req.params.pid);
    request.query(query, function (err, recordset) {
        if (err) throw err;
        res.redirect('/');
    });
}

// Converted
exports.p_create = function (req, res) {
    if (!req.sessions.user || req.sessions.privilege != 'god') {
        res.render('errors/notfound');
    }

    // MSSQL module takes care of sanitizing using @param in query string        
    var query = "INSERT INTO Posts (title, tags, topic, body_preview, body_markdown, date_time) VALUES (@title, @tags, @topic, @preview, @markdown, @date)";

    var request = new req.sql.Request();

    // Register inputs, automatically sanitized by mssql
    request.input('title', req.body.title);
    request.input('tags', req.body.tags);
    request.input('topic', req.body.topic);
    request.input('preview', req.body.preview);
    request.input('markdown', req.body.markdown);
    request.input('date', (new Date().getMonth()+1) + "-" + new Date().getDate() + "-" + new Date().getFullYear())

    // Check and upload files (if any exist)
    validateAndUploadFiles(req.files.photos, req.fs);

    request.query(query, function (err, recordset) {
        if (err) throw err;
        res.redirect('/');
    });
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