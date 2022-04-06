const { ipcRenderer } = require('electron');
var mysql = require('mysql');

/*
 * mysql connection
 * user: electronwebapp 
 * pwd: electronwebapp
*/

/*
 * show databases;
 * SELECT User, Host FROM mysql.user;
 */

/*
    Object.keys(result).forEach(function(key) {
      var row = result[key];
      console.log(row.name)
    });
*/

//Get information from SQL html page
// var hostSql = document.getElementById('hostSql').value;
// var usernameSql = document.getElementById('unameSql').value;
// var passwordSql = document.getElementById('pwdSql').value;
// var databaseSql = document.getElementById('dbSql').value;

let con = null;

function showPassword(pwdID) {
    var x = document.getElementById(pwdID);
    if (x.type === 'password') {
        x.type = 'text';
    } else {
        x.type = 'password';
    }
}

function login() {
    if (con == null) {
        con = mysql.createConnection({
            host: 'localhost',
            user: 'electronwebapp',
            password: 'electronwebapp',
            database: 'electronwebappDB'
        });

        console.warn("connect");
    }

    var usernameLogin = document.getElementById('unameLogin').value;
    var passwordLogin = document.getElementById('pwdLogin').value;

    console.warn("geia");

    con.connect(function (err) {
        alert("geia");
        if (err) throw alert(err);
        let sqlQuery = 'SELECT * FROM users WHERE username="' + usernameLogin + '" AND password="' + passwordLogin + '"';
        var result = con.query(sqlQuery, function (err, result) {
            if (err) throw alert(err);

            if (result != "") {
                ipcRenderer.send('changeWindow', 'map');
            } else {
                alert("Den yparxei o xristis");
            }
        });
    });

    console.warn("11111111111111");
}

function signUpButton() {
    if (document.getElementById('loginForm').hidden == false) {
        document.getElementById('loginForm').hidden = true;
    }

    document.getElementById('signUpForm').hidden = false;
}

function signUp() {
    if (con == null) {
        con = mysql.createConnection({
            host: 'localhost',
            user: 'electronwebapp',
            password: 'electronwebapp',
            database: 'electronwebappDB'
        });
    }

    var usernameSignUp = document.getElementById('unameSignUp').value;
    var genderSignUp = document.getElementById('genderSignUp').value;
    var passwordSignUp = document.getElementById('pwdSignUp').value;

    con.connect(function (err) {
        if (err) throw err;
        let sqlQuery = 'INSERT INTO users(username,gender,password) VALUES ( "' + usernameSignUp + '","' + genderSignUp + '","' + passwordSignUp + '" )';;
        con.query(sqlQuery, function (err, result) {
            if (err) throw alert("yparxei idi o user");

            ipcRenderer.send('changeWindow', 'sqlTomain');
        });
    });
}