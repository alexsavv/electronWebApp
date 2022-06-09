const { ipcRenderer } = require('electron');
var mysql = require('mysql');

// module.exports = {mysqlConnection};

let mysqlConnection1 = null;

function checkExistDB() {
    var host = document.getElementById('hostSql').value;
    var username = document.getElementById('unameSql').value;
    var pwd = document.getElementById('pwdSql').value;
    var database = document.getElementById('dbSql').value;

    if (mysqlConnection1 == null) {
        mysqlConnection1 = mysql.createConnection({
            host: host,
            user: username,
            password: pwd,
            database: database
        });
    }

    mysqlConnection1.connect(function (err) {
        if (err) throw alert('Den yparxei basi me ta stoixeia poy edwses');
        ipcRenderer.send('changeWindow', 'sqlTomain');
    });

    // module.exports = mysqlConnection1;
}

function showPassword(pwdID) {
    var x = document.getElementById(pwdID);
    if (x.type === 'password') {
        x.type = 'text';
    } else {
        x.type = 'password';
    }
}