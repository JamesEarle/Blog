/* GET */

exports.index = function(req, res) {
    req.connection.query("SELECT P.pid, P.title FROM Posts P", function(err, rows, fields) {
        if (err) throw err;

        res.render('index', {
            rows: rows,
        });
    });
};

exports.posts = function(req, res) {
    req.connection.query("SELECT * FROM Posts P WHERE P.pid=" + req.params.pid, function(err, rows, fields) {
        if (err) throw err;

        if (rows.length == 0) {
            res.render('errors/notfound');
        } else {
            res.render('posts/post', { row: rows[0] });
        }

    });
}

exports.g_login = function(req, res) {
    res.render('auth/login');
}

exports.g_register = function(req, res) {
    res.render('auth/register');
}

exports.g_create = function(req, res) {
    res.render('admin/create');
}

/* POST */
exports.p_login = function(req, res) {
    res.render('auth/register');
}

exports.p_register = function(req, res) {
    res.render('auth/register');
}

exports.p_create = function(req, res) {

    var query = "INSERT INTO Posts (title, thumbnail, tags, topic, body_preview, body_markdown) VALUES (";

    var args = [
        "\'" + req.body.title,
        req.files.thumbnail.name,
        req.body.tags,
        req.body.topic,
        req.body.preview,
        req.body.markdown + "\'"
    ];

    query += args.join("\', \'") + ")";

    req.connection.query(query, function(err, rows, fields) {
        if (err) throw err;
        res.redirect('/');
    });
}