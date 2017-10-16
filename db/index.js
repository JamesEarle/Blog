var env = require('../private');
var sql = require("mssql");

var config = {
    user: env.username,
    password: env.password,
    server: "jamesirl.database.windows.net",
    database: "blog",

    // As per the npm docs, encrypt=true for Azure connections
    options: {
        encrypt: true
    }
};

exports.query = function (query, callback, inputs) {
    sql.connect(config, function (err) {
        if (err) throw err;

        var request = new sql.Request();

        if (inputs) {
            for (var input in inputs) {
                var key = input;
                var val = inputs[key];
            }
            request.input(key, val);
        }

        request.query(query, function (err, result) {
            if (err) throw err;
            callback(result);
        })
    });
}