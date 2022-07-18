const { ipcRenderer } = require('electron');
var mysql = require('mysql');

window.$ = window.jQuery = require('../node_modules/jquery/dist/jquery.js');

let con = null;

$(document).ready(function () {
    $('#homePage-btn').on('click', () => {
        ipcRenderer.send('changeWindow', 'sqlTomain');
    });

    $('#submitDB').on('click', () => {
        document.getElementById('progressSql').hidden = false;

        var maxTimer = document.getElementById('progressbarSql').getAttribute('max');
        var minTimer = document.getElementById('progressbarSql').getAttribute('min');
        var timerValue = -1;

        document.getElementById('progressbarSql').setAttribute('value', minTimer);
        document.getElementById('progressbarSql').style = 'width: ' + minTimer + ' %;';
        var counterBack = setInterval(function () {
            timerValue = Number(document.getElementById('progressbarSql').getAttribute('value'));

            if (timerValue <= maxTimer) {
                document.getElementById('progressbarSql').setAttribute('value', (timerValue + 1));
                $('.progress-bar').css('width', timerValue + '%');
                document.getElementById('progressTextSql').innerHTML = timerValue + '%';
            } else {
                clearInterval(counterBack);
                checkExistDB();

                document.getElementById('progressSql').hidden = true;
            }
        }, 10);
    });
});

function getConnectionDB(con, host, user, password, database, table = null) {
    if (con) {
        con.end();
    }

    con = mysql.createConnection({
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
    var table = document.getElementById('tableSql').value;

    var infoDB = {};
    infoDB['host'] = host;
    infoDB['user'] = username;
    infoDB['password'] = pwd;
    infoDB['database'] = database;
    infoDB['table'] = table;

    localStorage.setItem('infoDB', JSON.stringify(infoDB));

    con = getConnectionDB(con, host, username, pwd, database);

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