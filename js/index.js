const { ipcRenderer } = require('electron');
var mysql = require('mysql');

window.$ = window.jQuery = require('./node_modules/jquery/dist/jquery.js');

$(document).ready(function () {
    $('#login-btn').on('click', () => {
        document.getElementById('progress').hidden = false;

        var maxTimer = document.getElementById('progressbar').getAttribute('max');
        var minTimer = document.getElementById('progressbar').getAttribute('min');
        var timerValue = -1;

        document.getElementById('progressbar').setAttribute('value', minTimer);
        document.getElementById('progressbar').style = 'width: ' + minTimer + ' %;';
        var counterBack = setInterval(function () {
            timerValue = Number(document.getElementById('progressbar').getAttribute('value'));

            if (timerValue <= maxTimer) {
                document.getElementById('progressbar').setAttribute('value', (timerValue + 1));
                $('.progress-bar').css('width', timerValue + '%');
                document.getElementById('progressText').innerHTML = timerValue + '%';
            } else {
                clearInterval(counterBack);
                login(infoDB['host'], infoDB['user'], infoDB['password'], infoDB['database']);

                document.getElementById('progress').hidden = true;
            }
        }, 10);
    });

    $('#showPassword-login-btn').on('click', () => {
        showPassword('pwdLogin');
    });

    $('#signUp-btn').on('click', () => {
        signUpButton();
    });

    $('#showPassword-signUp-btn').on('click', () => {
        showPassword('pwdSignUp');
    });

    $('#privacyTerms-btn').on('click', () => {
        privacyPwdTerms();
    });

    $('#cancelSignUp').on('click', () => {
        document.getElementById('signUpForm').hidden = true;
        document.getElementById('loginForm').hidden = false;
    });

});

const infoDB = {
    host: 'localhost',
    user: 'electronwebapp',
    password: 'electronwebAPP13!',
    database: 'electronwebappDB',
    table: 'users'
};

let con = null;

function getConnectionDB(con, host, user, password, database, table = null) {
    if(con){
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

function showPassword(pwdID) {
    var x = document.getElementById(pwdID);
    if (x.type === 'password') {
        x.type = 'text';
    } else {
        x.type = 'password';
    }
}

function login(host, user, password, database, table = null) {
    var usernameLogin = document.getElementById('unameLogin').value;
    var passwordLogin = document.getElementById('pwdLogin').value;

    con = getConnectionDB(con, infoDB['host'], infoDB['user'], infoDB['password'], infoDB['database']);

    con.connect(function (err) {
        if (err) throw alert(err);
        let sqlQuery = 'SELECT * FROM users WHERE username="' + usernameLogin + '" AND password="' + passwordLogin + '"';
        var resultQuery = con.query(sqlQuery, function (err, result) {
            if (err) throw alert(err);

            if (result != "") {
                localStorage.setItem('userID', usernameLogin);
                ipcRenderer.send('changeWindow', 'map');
            } else {
                alert("There is not user with these credentials. Please check the user's credentials or create a new one.");
            }
        });
    });
}

function signUpButton() {
    if (document.getElementById('loginForm').hidden == false) {
        document.getElementById('loginForm').hidden = true;
    }

    document.getElementById('signUpForm').hidden = false;
}

function usernameValidation(username) {
    var valid = false;
    valid = /^[a-zA-Z][a-z-A-Z0-9_]{7,20}$/.test(username);

    return valid;
}

function passwordValidation(password, repassword) {
    var valid = true;
    if (password == null || password == '' | password !== repassword) {
        alert('Verified password is wrong');
        valid = false;
    } else {
        valid = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,20}$/.test(password);
    }

    return valid;
}

function signUp() {
    var genderSignUp = document.getElementById('genderSignUp').value;

    var usernameSignUp = document.getElementById('unameSignUp').value;
    var validatedUsername = usernameValidation(usernameSignUp);

    var passwordSignUp = document.getElementById('pwdSignUp').value;
    var repassword = document.getElementById('changePwdRepeat').value;
    var validatedPassword = passwordValidation(passwordSignUp, repassword);

    con = getConnectionDB(con, infoDB['host'], infoDB['user'], infoDB['password'], infoDB['database']);
    
    if (validatedUsername && validatedPassword) {
        con.connect(function (err) {
            if (err) throw err;
            let sqlQuery = 'INSERT INTO users(username,gender,password) VALUES ( "' + usernameSignUp + '","' + genderSignUp + '","' + passwordSignUp + '" )';
            con.query(sqlQuery, function (err, result) {
                if (err) throw alert("There is already user with these credentials. You can login to the user account.");

                ipcRenderer.send('changeWindow', 'sqlTomain');
            });
        });
    } else {
        privacyPwdTerms();
        document.getElementById('cancelSignUp').click();
    }
}

function privacyPwdTerms() {
    alert("The username has to contain from 7 to 20 characters/numbers/underscore, starting with character.\n\nThe password has to contain from 7 to 20 characters, containing at least a number and special character");
}