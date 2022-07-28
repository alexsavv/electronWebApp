const { ipcRenderer } = require('electron');
const { commentAltEdit } = require('fontawesome');
var mysql = require('mysql');

window.$ = window.jQuery = require('./node_modules/jquery/dist/jquery.js');

localStorage.clear(); //clear localStorage in the start of app

let con = null;

var infoDB = JSON.parse(localStorage.getItem('infoDB'));
if (!infoDB) {
    infoDB = {
        'host': null,
        'user': null,
        'password': null,
        'database': null,
        'table': null
    }
}

$(document).ready(function () {
    $('#question-notDB-btn').on('click', () => {
        var checkQuestionDB = document.getElementById('exist-notDB').value;
        localStorage.setItem('userInfo', JSON.stringify({ 'containDB': checkQuestionDB }));
        if (checkQuestionDB != '') {
            document.getElementById('question-notDB').hidden = true;

            if (checkQuestionDB == 'true') {
                document.getElementById('loginForm').hidden = false;
                document.getElementById('connectDatabase').hidden = false;
            } else {
                document.getElementById('loginForm-notDB').hidden = false;
            }
        } else {
            alert('Please select an answer');
        }

    });

    $('#back-notDB-btn').on('click', () => {
        document.getElementById('question-notDB').hidden = false;

        document.getElementById('loginForm-notDB').hidden = true;
    });

    $('#login-notDB-btn').on('click', () => {
        var userInfo = JSON.parse(localStorage.getItem('userInfo'));

        var username = document.getElementById('unameLogin-notDB').value;
        var gender = document.getElementById('gender-notDB').value;

        if ((username && username != '') && (gender && gender != '')) {
            var validUsername = usernameValidation(username);
            if (validUsername) {
                userInfo['username'] = username;
                userInfo['gender'] = gender;
                localStorage.setItem('userInfo', JSON.stringify(userInfo));

                ipcRenderer.send('changeWindow', 'map');
            } else {
                privacyPwdTerms(true);
            }
        } else {
            alert('Please give a username and select your gender');
        }
    });

    $('#connectDatabase').on('click', () => {
        ipcRenderer.send('changeWindow', 'sql');
    });

    $('#back-btn').on('click', () => {
        document.getElementById('question-notDB').hidden = false;

        document.getElementById('loginForm').hidden = true;
        document.getElementById('connectDatabase').hidden = true;
    });

    $('#login-btn').on('click', () => {
        actionTOInputsButtons(true);
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
                actionTOInputsButtons(false);
            }
        }, 10);
    });

    $('#showPassword-login-btn').on('click', () => {
        showPassword('pwdLogin');
    });

    $('#signUp-btn').on('click', () => {
        signUpButton(true);
    });

    $('#showPassword-signUp-btn').on('click', () => {
        showPassword('pwdSignUp');
    });

    $('#privacyTerms-username-btn').on('click', () => {
        privacyPwdTerms(true);
    });

    $('#privacyTerms-btn').on('click', () => {
        privacyPwdTerms();
    });

    $('#cancelSignUp').on('click', () => {
        signUpButton(false);
    });

    $('#submitSignUp').on('click', () => {
        actionTOInputsButtons(true);
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
                signUp();

                document.getElementById('progress').hidden = true;
                actionTOInputsButtons(false);
            }
        }, 10);
    });

});

function getConnectionDB(con, host, user, password, database, table = null) {
    if (con != null && con != 'error') {
        con.end();
    }

    if (host != null && user != null && password != null && database != null) {
        con = mysql.createConnection({
            host: host,
            user: user,
            password: password,
            database: database
        });
    } else {
        con = 'error';
    }

    return con;
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

function login(host, user, password, database, table = null) {
    var usernameLogin = document.getElementById('unameLogin').value;
    var passwordLogin = document.getElementById('pwdLogin').value;

    con = getConnectionDB(con, infoDB['host'], infoDB['user'], infoDB['password'], infoDB['database']);

    if (con != null && con != 'error') {
        con.connect(function (err) {
            if (err) throw alert(err);
            let sqlQuery = 'SELECT * FROM users WHERE username="' + usernameLogin + '" AND password="' + passwordLogin + '"';
            var resultQuery = con.query(sqlQuery, function (err, result) {
                if (err) throw alert(err);

                if (result != "") {
                    localStorage.setItem('userInfo', JSON.stringify({ 'username': usernameLogin }));
                    ipcRenderer.send('changeWindow', 'map');
                } else {
                    alert("There is not user with these credentials or you try to connect to wrong database. Please check the user's and database credentials or create a new user or even a new database.");
                }
            });
        });
    } else {
        alert('Please check the database credentials');
    }
}

function signUpButton(value) {
    document.getElementById('loginForm').hidden = value;
    document.getElementById('signUpForm').hidden = !value;
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

    if (con != null && con != 'error') {
        if (validatedUsername && validatedPassword && genderSignUp != '') {
            let sqlQuery = 'INSERT INTO users(username,gender,password,' +
                'correctAnswersQuiz,totalAnswersQuiz,percentageAnswersQuiz,totalQuiz,' +
                'correctSmallAnswersQuiz,totalSmallAnswersQuiz,percentageSmallAnswersQuiz,totalSmallQuiz,' +
                'correctMediumAnswersQuiz,totalMediumAnswersQuiz,percentageMediumAnswersQuiz,totalMediumQuiz,' +
                'correctLargeAnswersQuiz,totalLargeAnswersQuiz,percentageLargeAnswersQuiz,totalLargeQuiz' +
                ') VALUES ( "' +
                usernameSignUp + '","' + genderSignUp + '","' + passwordSignUp + '","' +
                0 + '","' + 0 + '","' + 0 + '","' + 0 + '","' +
                0 + '","' + 0 + '","' + 0 + '","' + 0 + '","' +
                0 + '","' + 0 + '","' + 0 + '","' + 0 + '","' +
                0 + '","' + 0 + '","' + 0 + '","' + 0 + '" )';
            con.query(sqlQuery, function (err, result) {
                if (err)
                    throw alert("There is already user with these credentials or problem with database. You can login to the user account or even check the database credentials.");

                document.getElementById('cancelSignUp').click();
            });
        } else {
            privacyPwdTerms();
            signUpButton(true);
        }
    } else {
        alert('Please check the database credentials');
    }
}

function privacyPwdTerms(checkOnlyUsername = false) {
    if (checkOnlyUsername) {
        alert("The username has to contain from 7 to 20 characters/numbers/underscore, starting with character.");
    } else {
        alert("The username has to contain from 7 to 20 characters/numbers/underscore, starting with character.\n\nThe password has to contain from 7 to 20 characters, containing at least a number and special character \n\n The gender has to be one of the selections");
    }
}