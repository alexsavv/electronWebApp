const { ipcRenderer } = require('electron');
const { tablet } = require('fontawesome');
var mysql = require('mysql');

window.$ = window.jQuery = require('../node_modules/jquery/dist/jquery.js');

let infoDB = {};
let con = null;

$(document).ready(function () {
    $('#homePage-btn').on('click', () => {
        ipcRenderer.send('changeWindow', 'sqlTomain');
    });

    $('#submitDB').on('click', () => {
        actionTOInputsButtons(true);
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

                setGlobalVariableDB(con, 'SET GLOBAL validate_password.check_user_name = ON;');
                setGlobalVariableDB(con, 'SET GLOBAL validate_password.length = 8;');
                setGlobalVariableDB(con, 'SET GLOBAL validate_password.mixed_case_count = 1;');
                setGlobalVariableDB(con, 'SET GLOBAL validate_password.number_count = 1;');
                setGlobalVariableDB(con, 'SET GLOBAL validate_password.policy = MEDIUM;');
                setGlobalVariableDB(con, 'SET GLOBAL validate_password.special_char_count = 1;');

                checkExistDB();

                document.getElementById('progressSql').hidden = true;
                actionTOInputsButtons(false);
            }
        }, 10);
    });

    $('#createTableDB').on('click', () => {
        con = getConnectionDB(con, infoDB['host'], infoDB['user'], infoDB['password'], infoDB['database']);

        var sqlQuery = 'CREATE TABLE users (' +
            'username varchar(25),' +
            'password varchar(25),' +
            'gender varchar(25),' +
            'correctAnswersQuiz int,' +
            'totalAnswersQuiz int,' +
            'percentageAnswersQuiz int,' +
            'totalQuiz int,' +
            'correctSmallAnswersQuiz int,' +
            'totalSmallAnswersQuiz int,' +
            'percentageSmallAnswersQuiz int,' +
            'totalSmallQuiz int,' +
            'correctMediumAnswersQuiz int,' +
            'totalMediumAnswersQuiz int,' +
            'percentageMediumAnswersQuiz int,' +
            'totalMediumQuiz int,' +
            'correctLargeAnswersQuiz int,' +
            'totalLargeAnswersQuiz int,' +
            'percentageLargeAnswersQuiz int,' +
            'totalLargeQuiz int,' +
            'UNIQUE (username)' +
            ')';

        actionTOInputsButtons(true);
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

                setGlobalVariableDB(con, 'SET GLOBAL validate_password.check_user_name = ON;');
                setGlobalVariableDB(con, 'SET GLOBAL validate_password.length = 8;');
                setGlobalVariableDB(con, 'SET GLOBAL validate_password.mixed_case_count = 1;');
                setGlobalVariableDB(con, 'SET GLOBAL validate_password.number_count = 1;');
                setGlobalVariableDB(con, 'SET GLOBAL validate_password.policy = MEDIUM;');
                setGlobalVariableDB(con, 'SET GLOBAL validate_password.special_char_count = 1;');

                con.query(sqlQuery, function (err, result) {
                    if (err) throw alert(err);

                    alert('Table was created successfully');
                    return result;
                });

                document.getElementById('progressSql').hidden = true;
                actionTOInputsButtons(false);
            }
        }, 10);
    });

});

function setGlobalVariableDB(con, sqlQuery) {
    con.query(sqlQuery, function (err, result) {
        return result;
    });
}

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
    var userInfoLocalStorage = JSON.parse(localStorage.getItem('userInfo'));
    
    if(userInfoLocalStorage['containDB'] == 'false'){
        return;
    }

    var host = document.getElementById('hostSql').value;
    var username = document.getElementById('unameSql').value;
    var pwd = document.getElementById('pwdSql').value;
    var database = document.getElementById('dbSql').value;
    var table = document.getElementById('tableSql').value;

    infoDB['host'] = host;
    infoDB['user'] = username;
    infoDB['password'] = pwd;
    infoDB['database'] = database;
    infoDB['table'] = table;

    localStorage.setItem('infoDB', JSON.stringify(infoDB));

    con = getConnectionDB(con, host, username, pwd, database);

    var sqlQuery = 'SELECT * FROM ' + table;
    con.query(sqlQuery, function (err, result) {
        if (err) throw alert('Please create the table or even check the database credentials');

        ipcRenderer.send('changeWindow', 'sqlTomain');

        return result;
    });
    
}

function actionTOInputsButtons(value) {
    for (const buttons of document.getElementsByClassName('btn')) {
        buttons.disabled = value;
    }
    for (const input of document.getElementsByTagName('input')) {
        input.disabled = value;
    }
}

function showPassword(pwdID) {
    var x = document.getElementById(pwdID);
    if (x.type === 'password') {
        x.type = 'text';
    } else {
        x.type = 'password';
    }
}