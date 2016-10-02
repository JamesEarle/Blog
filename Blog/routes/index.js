
/*
 * GET home page.
 */

var test = "# DJKhaled How much water did you drink today? Need some inspiration? Let DJ Khaled give it to you !This Google Chrome extension provides a fresh DJ Khaled background every time you open a new tab, along with somedeeply personal, inspiring quotes to help get you through your day.Bless up, we the best. *[Download Here](https://chrome.google.com/webstore/detail/dj-khaled-tabs/ohcphfnhjdpdfggahdmpmadnoaoflmoa)* # **2,000** Active Users in Chrome, Major Key :key: :pray:";
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