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


function showPassword(pwdID) {
    var x = document.getElementById(pwdID);
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}

function checkLoginCorrectness() {
    var loginName = document.getElementById('uname').value

    var loginPwd = document.getElementById('pwd').value


    return false;
}

function login() {
    if (!checkLoginCorrectness()) {
        document.getElementById('loginError').textContent = "ggg";
        return
    }

    var host = document.getElementById("hostSql").value;
    var username = document.getElementById("unameSql").value;
    var pwd = document.getElementById("pwdSql").value;
    var database = document.getElementById("dbSql").value;

    const con = mysql.createConnection({
        host: host,
        user: username,
        password: pwd
    });

    con.connect(function (err) {
        if (err) throw err;
        // console.warn("Connected!");
        con.query("SELECT * FROM users", function (err, result) {
            if (err) throw err;
            console.warn("sss");
        });
    });

    // ipcRenderer.send("changeWindow", "map");
}

function signUp() {
    if (document.getElementById("loginForm").hidden == false) {
        document.getElementById("loginForm").hidden = true;
    }

    document.getElementById("signInForm").hidden = false;
}

// function checkExistDB() {
//     var host = document.getElementById("hostSql").value;
//     var username = document.getElementById("unameSql").value;
//     var pwd = document.getElementById("pwdSql").value;
//     var database = document.getElementById("dbSql").value;

//     const con1 = mysql.createConnection({
//         host: host,
//         user: username,
//         password: pwd
//     });

//     con1.connect(function (err) {
//         if (err) throw alert(err);
//         let sqlQuery = "use " + database;
//         con1.query(sqlQuery, function (err, result) {
//             if (err) throw alert(err);
//             ipcRenderer.send("changeWindow", "map");
            
//             con1.destroy();
//         });
//     });
// }