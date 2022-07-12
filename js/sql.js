const { ipcRenderer } = require('electron');
var mysql = require('mysql');

window.$ = window.jQuery = require('../node_modules/jquery/dist/jquery.js');

$(document).ready(function () {
    $('#homePage-btn').on('click', () => {
        ipcRenderer.send('changeWindow', 'sqlTomain');
    });
});

function getConnectionDB(host, user, password, database, table = null){
    var con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: database
    });

    return con;
}

function checkExistDB() {
    var host = document.getElementById('hostSql').value;
    var username = document.getElementById('unameSql').value;
    var pwd = document.getElementById('pwdSql').value;
    var database = document.getElementById('dbSql').value;

    let con = getConnectionDB(host, username, pwd, database);
    con.connect(function (err) {
        if (err) throw alert('There is not database with these credentials. Please check the credentials.');
        ipcRenderer.send('changeWindow', 'sqlTomain');
    });
}

function showPassword(pwdID) {
    var x = document.getElementById(pwdID);
    if (x.type === 'password') {
        x.type = 'text';
    } else {
        x.type = 'password';
    }
}