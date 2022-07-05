var mysql = require('mysql');

const infoDB = {
    host: 'localhost',
    user: 'electronwebapp',
    password: 'electronwebAPP13!',
    database: 'electronwebappDB',
    table: 'users'
};

let con = getConnectionDB(infoDB['host'], infoDB['user'], infoDB['password'], infoDB['database']);

function getConnectionDB(host, user, password, database, table = null){
    var con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: database
    });

    return con;
}

function userLogin() {
    console.warn("User Login");

    con.connect(function (err) {
        if (err) throw err;
        console.warn("Connected!");
        con.query("CREATE DATABASE IF NOT EXISTS electronwebappDB", function (err, result) {
            if (err) throw err;
            console.warn("Database created");
        });
    });
}

