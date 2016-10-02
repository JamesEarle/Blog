/* GET */

exports.index = function (req, res) {
    //console.log(req.connection);
    req.connection.query("SELECT * FROM posts", function (err, rows, fields) {
        if (err) throw err;
        
        var renderedhtml = [];

        for (var i = 0; i < rows.length; i++) {
            var elem = (req.marked(rows[i].body_md));
            elem.replace("\"", "\'");
            renderedhtml.push(elem);
        }

        res.render('index', {
            rows: rows,
            html: renderedhtml,
            marked: req.marked
        });
    });
};

exports.posts = function (req, res) {
    req.connection.query("SELECT * FROM Posts P WHERE P.pid=" + req.params.pid, function (err, rows, fields) {
        if (err) throw err;
        
        if (rows.length == 0) {
            res.render('notfound');
        } else {
            res.render('posts', {row: rows[0]});
        }

    });
}

exports.g_login = function (req, res) {
    res.render('login');
}

exports.g_register = function (req, res) {
    res.render('register');
}

/* POST */
exports.p_login = function (req, res) {
    res.render('login');
}

exports.p_register = function (req, res) {
    res.render('register');
}