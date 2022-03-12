const { ipcRenderer } = require("electron");
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
const con = mysql.createConnection({
    host: "localhost",
    user: "electronwebapp",
    password: "electronwebapp"
});

function showPassword(){
        var x = document.getElementById("pwd");
        if (x.type === "password") {
            x.type = "text";
        } else {
            x.type = "password";
        }
}

function checkLoginCorrectness(){
    var loginName = document.getElementById('uname').value

    var loginPwd = document.getElementById('pwd').value


    return false;
}

function login() {
    if(!checkLoginCorrectness()){
        document.getElementById('loginError').textContent = "ggg";
        return
    }

    // con.connect(function (err) {
    //     if (err) throw err;
    //     console.warn("Connected!");
    //     con.query("CREATE DATABASE IF NOT EXISTS electronwebappDB", function (err, result) {
    //         if (err) throw err;
    //         console.warn("Database created");
    //     });
    // });

    con.connect(function (err) {
        if (err) throw err;
        console.warn("Connected!");
        con.query("SELECT * FROM users", function (err, result) {
            if (err) throw err;
            console.warn("sss");
        });
    });

    ipcRenderer.send("changeWindow", "map");
}

function signUp() {
    if (document.getElementById("loginForm").hidden == false) {
        document.getElementById("loginForm").hidden = true;
    }

    document.getElementById("signInForm").hidden = false;
}