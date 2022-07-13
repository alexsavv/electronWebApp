const { ipcRenderer } = require('electron');
var mysql = require('mysql');

window.$ = window.jQuery = require('./node_modules/jquery/dist/jquery.js');

$(document).ready(function () {
    $('#login-btn').on('click', () => {
        alert('Welcome to the Electron Web App. \n\n If you dont see the map window, please click again the Login button');
        login();
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

let con = getConnectionDB(infoDB['host'], infoDB['user'], infoDB['password'], infoDB['database']);

function getConnectionDB(host, user, password, database, table = null) {
    var con = mysql.createConnection({
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

function login() {
    var usernameLogin = document.getElementById('unameLogin').value;
    var passwordLogin = document.getElementById('pwdLogin').value;

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
    if (con == null) {
        con = mysql.createConnection({
            host: 'localhost',
            user: 'electronwebapp',
            password: 'electronwebAPP13!',
            database: 'electronwebappDB'
        });
    }

    var genderSignUp = document.getElementById('genderSignUp').value;

    var usernameSignUp = document.getElementById('unameSignUp').value;
    var validatedUsername = usernameValidation(usernameSignUp);

    var passwordSignUp = document.getElementById('pwdSignUp').value;
    var repassword = document.getElementById('changePwdRepeat').value;
    var validatedPassword = passwordValidation(passwordSignUp, repassword);

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