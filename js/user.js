
function userLogin() {
    console.warn("User Login");
    /*
     * mysql connection
     * user: electronwebapp 
     * pwd: electronwebAPP13!
     */

    /*
     * show databases;
     * SELECT User, Host FROM mysql.user;
     */

    var mysql = require('mysql');

    var con = mysql.createConnection({
        host: "localhost",
        user: "electronwebapp",
        password: "electronwebAPP13!"
    });

    con.connect(function (err) {
        if (err) throw err;
        console.warn("Connected!");
        con.query("CREATE DATABASE IF NOT EXISTS electronwebappDB", function (err, result) {
            if (err) throw err;
            console.warn("Database created");
        });
    });
}

