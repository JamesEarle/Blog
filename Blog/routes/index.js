/* GET */

exports.index = function (req, res) {
    var query = "SELECT P.pid, P.title, P.tags, P.topic, P.body_preview FROM Posts P ORDER BY P.date_created DESC";

    req.connection.query(query, function (err, rows, fields) {
        if (err) throw err;

        res.render('index', {
            rows: rows,
        });
    });
};

exports.index_filter = function (req, res) {
    var query = "SELECT P.pid, P.title, P.tags, P.topic, P.body_preview FROM Posts P WHERE P.topic = \'" + req.params.filter + "\' ORDER BY P.date_created DESC"

    req.connection.query(query, function (err, rows, fields) {
        if (err) throw err;

        res.render('index', {
            rows: rows,
            length: rows.length
        });
    });
};

exports.posts = function (req, res) {
    req.connection.query("SELECT * FROM Posts P WHERE P.pid=" + req.params.pid, function (err, rows, fields) {
        if (err) throw err;

        if (rows.length == 0) { // Bad ID
            res.render('errors/notfound');
        } else if (rows.length == 1) { // Found it
            rows[0].body_markdown = req.md.render(rows[0].body_markdown);
            res.render('posts/post', { row: rows[0] });
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
    res.render('admin/create');
}

exports.g_edit = function (req, res) {
    var query = "SELECT * FROM Posts P WHERE P.pid=" + req.params.pid;

    req.connection.query(query, function (err, rows, fields) {
        if (err) throw err;

        if (rows.length == 0) { // Bad ID, can't find post
            res.render('errors/notfound');
        } else if (rows.length == 1) { // Post found
            res.render('admin/edit', { row: rows[0] });
        } else { // You've broken spacetime
            res.render('errors/servererror');
        }
    });
}

/* POST */
exports.p_edit = function (req, res) {
    // ? used to mark where an escaped variable will be inserted.
    var query = "UPDATE Posts SET title=?, tags=?, topic=?, body_preview=?, body_markdown=? WHERE pid=" + req.params.pid;

    // MySQL module takes care of sanitizing using ? in query string
    var args = [
        req.body.title,
        req.body.tags,
        req.body.topic,
        req.body.preview,
        req.body.markdown
    ];

    // Check and upload files (if any exist)
    validateAndUploadFiles(req.files.photos, req.fs);

    // Query
    req.connection.query(query, args, function (err, rows, fields) {
        if (err) throw err;

        res.redirect('/');
    });
}

exports.p_login = function (req, res) {
    res.render('auth/register');
}

exports.p_register = function (req, res) {
    var query = "INSERT INTO Users (username, password, privilege) VALUES (?, ?, ?)";

    var args = [
        req.body.username,
        req.bcrypt.hashSync(req.body.password)
    ];

    // Is this narcissism?
    var privilege = req.body.username == "jamesearle" ? "god" : "user";
    args.push(privilege);

    console.log(args[1].length);

    // TODO: make registration also log you in
    req.connection.query(query, args, function (err, rows, fields) {
        if (err) throw err;
        res.redirect('/');
    });
}

exports.delete = function (req, res) {
    var query = "DELETE FROM Posts WHERE pid=" + req.params.pid; //delete from ....

    req.connection.query(query, function (err, rows, fields) {
        if (err) throw err;
        res.redirect('/');
    });
}

exports.p_create = function (req, res) {
    // MySQL module takes care of sanitizing using ? in query string        
    var query = "INSERT INTO Posts (title, tags, topic, body_preview, body_markdown) VALUES (?, ?, ?, ?, ?)";

    var args = [
        req.body.title,
        req.body.tags,
        req.body.topic,
        req.body.preview,
        req.body.markdown,
    ];

    // Check and upload files (if any exist)
    validateAndUploadFiles(req.files.photos, req.fs);

    req.connection.query(query, args, function (err, rows, fields) {
        if (err) throw err;
        res.redirect('/');
    });
}

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