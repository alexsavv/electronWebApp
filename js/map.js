const { ipcRenderer, session } = require('electron');
const L = require('leaflet');
var mysql = require('mysql');

require('leaflet.bigimage');
require('leaflet-sidebar-v2');

require('../node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.src.js');

//npm packages for country information
const countryListNpm = require('countries-list');
const countryjsNpm = require('countryjs');

//npm packages for currency information
const currencyCountry = require('iso-country-currency');
const currencyList = require('currency-codes');
require('fontawesome');

//jQuery npm package
window.$ = window.jQuery = require('../node_modules/jquery/dist/jquery.js');

let mymap = null;
var circleMarkers = [];

let questionsArray = [];

$(document).ready(function () {
    $('#sidebar-disconnect').on('click', () => {
        disconnect();
    });

    $('#sidebar-userProfile-btn').on('click', () => {
        profile();
    });

    $('#logOut-btn').on('click', () => {
        disconnect();
    });

    $('#mapFunctionality-btn').on('click', () => {
        mapFunctionality();
    });

    $('#intro-info').on('click', () => {
        document.getElementById('intro-login').hidden = false;
        document.getElementById('intro-info').disabled = true;

        document.getElementById('mapContainer').hidden = true;
        document.getElementById('mapFunctionality-btn').disabled = false;
    });

    //Password functionality
    $('#showRePwd').on('click', () => {
        showRePassword('changePwd');
    });

    $('#editRePwd').on('click', () => {
        editRePassword(false);
    });

    $('#submitRePwd').on('click', () => {
        submitPwd();
    });

    $('#privacyTerms-btn-change').on('click', () => {
        privacyPwdTerms();
    });
    //End Password functionality

    $('#deleteUser').on('click', () => {
        deleteUser();
    });

    $('#removeMarkers').on('click', () => {
        for (var i = 0; i < circleMarkers.length; i++) {
            mymap.removeLayer(circleMarkers[i]);
        }

        circleMarkers = [];
    });

    //Country Information
    $('#countrySubmit').on('click', () => {
        document.getElementById('countryData').innerHTML = '';

        var languagesJson = JSON.parse(localStorage.getItem('languages'));

        var countryHtmlElem = document.getElementById('countrySelection');
        if (countryHtmlElem.value == '') {
            alert('Select a country');
            return;
        }
        var countryData = document.getElementById('countryData');

        var varString = '';
        var outputValue = '';

        var countryInfoJson = {};
        var preElem = document.createElement('pre');
        if (!countryjsNpm.info(countryHtmlElem.value)) {
            outputValue = 'No Information for this country';

            varString = outputValue;

            preElem = document.createElement('pre');
            preElem.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;' + varString;

            countryData.appendChild(preElem);
            return;
        }

        countryInfoJson['name'] = countryjsNpm.info(countryHtmlElem.value)['name'];
        countryInfoJson['nativeName'] = countryjsNpm.info(countryHtmlElem.value)['nativeName'];
        countryInfoJson['capital'] = countryjsNpm.info(countryHtmlElem.value)['capital'];
        countryInfoJson['population'] = countryjsNpm.info(countryHtmlElem.value)['population'];

        countryInfoJson['region'] = countryjsNpm.info(countryHtmlElem.value)['region'];
        countryInfoJson['subregion'] = countryjsNpm.info(countryHtmlElem.value)['subregion'];

        countryInfoJson['languages'] = countryjsNpm.info(countryHtmlElem.value)['languages'];

        countryInfoJson['callingCodes'] = countryjsNpm.info(countryHtmlElem.value)['callingCodes'];
        countryInfoJson['currencies'] = countryjsNpm.info(countryHtmlElem.value)['currencies'];
        countryInfoJson['timezones'] = countryjsNpm.info(countryHtmlElem.value)['timezones'];

        countryInfoJson['latlng'] = countryjsNpm.info(countryHtmlElem.value)['latlng'];

        var countrySelected = countryListNpm['countries'][countryHtmlElem.value];

        countryInfoJson['emoji'] = countrySelected['emoji'];

        for (var key in countryInfoJson) {
            if (key == 'latlng') {
                var markerPoint = L.circleMarker(countryInfoJson['latlng']).addTo(mymap);
                markerPoint.on('click', function (e) {
                    mymap.removeLayer(markerPoint);
                })
                circleMarkers.push(markerPoint);

                mymap.setView(countryInfoJson['latlng'], 5);
                continue;
            }

            outputValue = '';

            if (typeof (countryInfoJson[key]) == 'object') {
                var outputJvalue = '';
                for (var jKey in countryInfoJson[key]) {
                    outputJvalue = '';
                    if (key == 'languages') {
                        var languangeName = languagesJson[countryInfoJson[key][jKey]]['name'];
                        var languangeNative = languagesJson[countryInfoJson[key][jKey]]['native'];
                        if (languangeName && languangeNative) {
                            outputJvalue = languangeName + ' (' + languangeNative + ')';
                        } else {
                            outputJvalue = countryInfoJson[key][jKey];
                        }
                    }
                    else if (key == 'currencies') {
                        var currencyName = currencyList.code(countryInfoJson[key][jKey])['currency'];
                        var currencySymbol = currencyCountry.getAllInfoByISO(countryHtmlElem.value)['symbol'];
                        if (currencyName && currencySymbol) {
                            outputJvalue = currencyName + ' (' + currencySymbol + ')';
                        } else {
                            outputJvalue = countryInfoJson[key][jKey];
                        }
                    } else {
                        outputJvalue = countryInfoJson[key][jKey];
                    }
                    outputValue += '<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + outputJvalue;
                }
            } else {
                outputValue = countryInfoJson[key];
            }

            if (key == 'emoji') {
                var divCont = document.createElement('div');
                divCont.id = 'emojiContainer';
                divCont.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';

                var divElemSymbol = document.createElement('div');
                divElemSymbol.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;' + key + ':  ';
                divElemSymbol.id = 'preElem';
                divElemSymbol.style = 'display: inline';

                var divElem = document.createElement('div');
                divElem.innerHTML = outputValue;
                divElem.style = 'zoom: 500%; display: inline';
                divElem.id = 'emojiSymbol';
                let infoDB = JSON.parse(localStorage.getItem('infoDB'));
                divCont.appendChild(divElem);

                countryData.appendChild(divCont);
            } else {

                varString = key + ' : ' + outputValue;

                preElem = document.createElement('pre');
                preElem.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;' + varString;

                countryData.appendChild(preElem);
            }
        }
    });

    //Quiz
    $('#sidebar-quiz').on('click', () => {
        $('#quizModal').show('modal');

        // console.warn("geia");
        // $( "sidebar-disconnect" ).removeAttr('href');

        $('#defaultBody').show();
        $('#quizBody').hide();

        $('#quizQuestions').html('');
        document.getElementById('modalTitle').innerHTML = 'Quiz for Countries';
    });

    $('#closeQuizModal').on('click', () => {
        //set all categories to false
        var quizCategory = document.getElementsByName('quizCategory');
        for (var i = 0, length = quizCategory.length; i < length; i++) {
            quizCategory[i].checked = false;
        }

        $('#defaultBody').show();
        $('#quizBody').hide();

        $('#quizModal').hide('modal');

        // document.getElementById('sidebar-userProfile-btn').disabled = false;
        // document.getElementById('sidebar-country-btn').disabled = false;
        // document.getElementById('sidebar-disconnect').disabled = false;
    });

    $("#disablePanel").on("click", function () {
        $(".accordion-toggle").attr("data-toggle", "");
    });

    $("#enablePanel").on("click", function () {
        $(".accordion-toggle").attr("data-toggle", "collapse");
    });

    $('#startQuiz').on('click', () => {
        questionsArray = [];

        localStorage.setItem('quizGrade', JSON.stringify({ 'grade': 0, 'total': 0, 'percentage': 0 }));

        var quizCategory = document.getElementsByName('quizCategory');
        var categoryKey = null;
        for (var i = 0, length = quizCategory.length; i < length; i++) {
            if (quizCategory[i].checked) {
                categoryKey = quizCategory[i].value;
                break;
            }
        }

        var quizSize = document.getElementsByName('quizSize');
        var quizLen = null;
        for (var i = 0, length = quizSize.length; i < length; i++) {
            if (quizSize[i].checked) {
                quizLen = quizSize[i].value;
                break;
            }
        }

        if (!categoryKey || !quizLen) {
            alert('Please select the quiz category and size in order to start the quiz');
        } else {
            $('#defaultBody').hide();
            $('#quizBody').show();

            var categoryValue = null;
            categoryValue = 'country';

            var categoryJson = { 'key': categoryKey, 'value': categoryValue, 'size': quizLen }
            localStorage.setItem('quizCategory', JSON.stringify(categoryJson));

            $('#nextQuestion').click();
        }
    });

    $('#nextQuestion').on('click', () => {
        var categoryJSON = JSON.parse(localStorage.getItem('quizCategory'));

        var gradeJSON = JSON.parse(localStorage.getItem('quizGrade'));

        if (document.getElementById('quizQuestions').innerHTML) {
            var quizCategory = document.getElementsByName('quizAnswer');
            var checkedAnswer = null;
            for (var i = 0, length = quizCategory.length; i < length; i++) {
                if (quizCategory[i].checked) {
                    checkedAnswer = quizCategory[i].value;
                    break;
                }
            }

            if (checkedAnswer == null) {
                alert('Select an answer');
                return;
            }

            var answer = JSON.parse(localStorage.getItem('correctAnswer'));
            var validAnswer = checkAnswer(answer);
            if (validAnswer == 1) {
                alert('The answer is ' + toUnicodeVariant('correct', 'bold sans', 'bold'));
            } else {
                alert('The answer is ' + toUnicodeVariant('false', 'bold sans', 'bold') + '. The correct country is  ' + toUnicodeVariant(answer['country'], 'bold sans', 'bold'));
            }

            gradeJSON['grade'] = Number(gradeJSON['grade']) + validAnswer;
            gradeJSON['total'] = Number(gradeJSON['total']) + 1;
            gradeJSON['percentage'] = (parseFloat(Number(gradeJSON['grade']) / Number(gradeJSON['total'])).toFixed(2)) * 100;
            localStorage.setItem('quizGrade', JSON.stringify(gradeJSON));

        }

        if (Number(gradeJSON['total']) < Number(categoryJSON['size'])) {
            document.getElementById('modalTitle').innerHTML = 'Quiz for Countries (' +
                toUnicodeVariant(String((gradeJSON['total'] + 1)), 'bold sans', 'bold') + '/' +
                toUnicodeVariant(String(categoryJSON['size']), 'bold sans', 'bold') + ' questions)';

            createQuestion(categoryJSON['key'], categoryJSON['value']);
        } else {
            var emojiGrade = getGradeEmoji(gradeJSON['percentage']);
            
            alert('Grade: ' + 
                toUnicodeVariant(String(gradeJSON['percentage']), 'bold sans', 'bold') + '% (' +
                toUnicodeVariant(String(gradeJSON['grade']), 'bold sans', 'bold') + '/' +
                toUnicodeVariant(String(gradeJSON['total']), 'bold sans', 'bold') + ') ' + 
                emojiGrade);

            if (gradeJSON['grade'] == categoryJSON['size']) {
                alert(' 📢 📢 🥳🥳 WINNER 🥳🥳');
            }

            userInfo['quiz']['correctAnswersQuiz'] = Number(userInfo['quiz']['correctAnswersQuiz']) + Number(gradeJSON['grade']);
            userInfo['quiz']['totalAnswersQuiz'] = Number(userInfo['quiz']['totalAnswersQuiz']) + Number(gradeJSON['total']);
            userInfo['quiz']['percentageAnswersQuiz'] = (parseFloat(Number(userInfo['quiz']['correctAnswersQuiz']) / Number(userInfo['quiz']['totalAnswersQuiz'])).toFixed(2)) * 100;
            userInfo['quiz']['totalQuiz'] = Number(userInfo['quiz']['totalQuiz']) + 1;

            localStorage.setItem('quiz', JSON.stringify(userInfo['quiz']));

            $('#closeQuizModal').click();
            return;
        }

    });
});

let infoDB = JSON.parse(localStorage.getItem('infoDB'));

let con = null;

let userInfo = {
    'username': localStorage.getItem('userID'),
    'gender': '',
    'profileImage': '',
    'quiz':{
        'correctAnswersQuiz' : 0,
        'totalAnswersQuiz' : 0,
        'percentageAnswersQuiz' : 0,
        'totalQuiz' : 0
    }
}

GetUsername();

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

//get username, gender, profileImage
function GetUsername() {
    con = getConnectionDB(con, infoDB['host'], infoDB['user'], infoDB['password'], infoDB['database']);

    con.connect(function (err) {
        if (err) throw alert(err);

        let sqlQuery = 'SELECT * FROM users WHERE username="' + userInfo['username'] + '"';
        con.query(sqlQuery, function (err, result) {
            if (err) throw alert(err);

            userInfo['gender'] = result[0]['gender'];

            if (result[0]['gender'] == 'female') {
                userInfo['profileImage'] = "../img/femaleProfile.png";
            } else if (result[0]['gender'] == 'male') {
                userInfo['profileImage'] = "../img/maleProfile.png";
            } else {
                userInfo['profileImage'] = "../img/otherProfile.png";
            }

            userInfo['quiz']['correctAnswersQuiz'] = result[0]['correctAnswersQuiz'];
            userInfo['quiz']['totalAnswersQuiz'] = result[0]['totalAnswersQuiz'];
            userInfo['quiz']['percentageAnswersQuiz'] = result[0]['percentageAnswersQuiz'];
            userInfo['quiz']['totalQuiz'] = result[0]['totalQuiz'];
            
            localStorage.setItem('quiz', JSON.stringify(userInfo['quiz']));
            return result;
        });
    });
}

function disconnect() {
    document.getElementById('intro-login').hidden = false;
    document.getElementById('intro-info').disabled = true;

    document.getElementById('mapContainer').hidden = true;
    document.getElementById('mapFunctionality-btn').disabled = false;

    con = getConnectionDB(con, infoDB['host'], infoDB['user'], infoDB['password'], infoDB['database']);

    con.connect(function (err) {
        if (err) throw err;
        let sqlQuery = 'UPDATE users SET ' +
        'correctAnswersquiz = "' + userInfo['quiz']['correctAnswersQuiz'] + 
        '", totalAnswersQuiz = "' + userInfo['quiz']['totalAnswersQuiz'] + 
        '", percentageAnswersQuiz = "' + userInfo['quiz']['percentageAnswersQuiz'] +
        '", totalQuiz = "' + userInfo['quiz']['totalQuiz'] + 
        '" WHERE username = "' + userInfo['username'] + '"';

        con.query(sqlQuery, function (err, result) {
            if (err)
                throw alert("Error in Table Update for userProfile");

            ipcRenderer.send('changeWindow', 'main');
        });
    });

    // ipcRenderer.send('changeWindow', 'main');
}

function profile() {
    document.getElementById('unameProfile').value = userInfo['username'];
    document.getElementById('genderProfile').value = userInfo['gender'];

    userInfo['quiz'] = JSON.parse(localStorage.getItem('quiz'));
    
    var emojiGrade = getGradeEmoji(userInfo['quiz']['percentageAnswersQuiz']);

    document.getElementById('gradeQuiz').style="font-size: 13px; font-weight: bold; color: red;";
    document.getElementById('gradeQuiz').value = '' + userInfo['quiz']['percentageAnswersQuiz'] + '% ' +
     ' ' + userInfo['quiz']['correctAnswersQuiz'] + '/' + userInfo['quiz']['totalAnswersQuiz'] +
     ' Total quizs: ' + userInfo['quiz']['totalQuiz'] + ' ' + emojiGrade;

    document.getElementById('imgProfile').src = userInfo['profileImage'];
}

function mapFunctionality() {
    document.getElementById('intro-login').hidden = true;
    document.getElementById('intro-info').disabled = false;

    document.getElementById('mapContainer').hidden = false;
    document.getElementById('mapFunctionality-btn').disabled = true;

    var leafletMap = document.getElementById('leafletMap');
    if (leafletMap != null) {
        return;
    }

    var divElem = document.createElement('div');
    divElem.id = 'leafletMap';
    divElem.style = 'margin: 30px';
    divElem.hidden = false;

    document.getElementById('mapContainer').appendChild(divElem);

    var mapParameters = {
        worldCopyJump: true,
        attributionControl: false
    }

    mymap = L.map('leafletMap', mapParameters).setView([0, 0], 1);
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright"> \
        OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'map',
    }).addTo(mymap);
    mymap.setView([37, 25], 8);

    L.control.BigImage({ position: 'topleft' }).addTo(mymap);

    L.control.coordinates({
        position: 'bottomright',

        decimals: 2,
        decimalSeparator: '.',

        labelTemplateLat: '{y}',
        labelTemplateLng: '- {x}',

        centerUserCoordinates: true,

        useDMS: true,
        useLatLngOrder: true,

        enableUserInput: true
    }).addTo(mymap);

    L.control.sidebar({
        autopan: true,       // whether to maintain the centered map point when opening the sidebar
        closeButton: true,    // whether t add a close button to the panes
        container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
        position: 'left',     // left or right
    }).addTo(mymap);

    getCountriesLanguages();
}

function deleteUser() {
    var confirmDelete = window.confirm('Are you sure that you want to delete the user?');
    if (!confirmDelete) return;

    con = getConnectionDB(con, infoDB['host'], infoDB['user'], infoDB['password'], infoDB['database']);

    con.connect(function (err) {
        if (err) throw alert(err);

        var username = document.getElementById('unameProfile').value;
        let sqlQuery = 'DELETE FROM ' + infoDB['table'] + ' WHERE username = "' + username + '";';
        con.query(sqlQuery, function (err, result) {
            if (err) throw alert(err);

            disconnect();

            return result;
        });
    });
}function getGradeEmoji(gradePercentageQuiz){
    var emojiGrade = '';

    if (gradePercentageQuiz == 0) {
        emojiGrade = '🤫';
    } else if (gradePercentageQuiz <= 25) {
        emojiGrade = '😡';
    } else if (gradePercentageQuiz <= 50) {
        emojiGrade = '🤔';
    } else if (gradePercentageQuiz <= 75) {
        emojiGrade = '🤗';
    } else if (gradePercentageQuiz >= 95 && gradePercentageQuiz <= 99) {
        emojiGrade = '🤬';
    } else if (gradePercentageQuiz <= 100) {
        emojiGrade = '😱';
    }

    return emojiGrade
}

function editRePassword(value) {
    document.getElementById('changePwd').disabled = value;
    document.getElementById('showRePwd').disabled = value;
    document.getElementById('changePwdRepeat').disabled = value;

    document.getElementById('submitRePwd').disabled = value;
    document.getElementById('editRePwd').disabled = !value;
}

function submitPwd() {
    var changePwdValue = document.getElementById('changePwd').value;
    var changePwdRepeatValue = document.getElementById('changePwdRepeat').value;

    var validatedPassword = passwordReValidation(changePwdValue, changePwdRepeatValue);

    if (validatedPassword) {
        var confirmChangePwd = window.confirm('Are you sure that you want to change the user\'s password');
        if (!confirmChangePwd) {
            editRePassword(true);
            return;
        }
    } else {
        privacyPwdTerms();
        editRePassword(true);
        return;
    }

    rePwdValue = document.getElementById('changePwd').value;

    con = getConnectionDB(con, infoDB['host'], infoDB['user'], infoDB['password'], infoDB['database']);

    let sqlQuery = 'UPDATE ' + infoDB['table'] + ' SET password = "' + rePwdValue + '" WHERE username = "' + username + '";';
    con.query(sqlQuery, function (err, result) {
        if (err) throw alert(err);

        return result;
    });

    document.getElementById('changePwd').value = '';
    editRePassword(true);
}

function showRePassword(pwdID) {
    var x = document.getElementById(pwdID);
    if (x.type === 'password') {
        x.type = 'text';
    } else {
        x.type = 'password';
    }
}

function passwordReValidation(password, repassword) {
    var valid = true;
    if (password == null || password == '' | password !== repassword) {
        alert('Verified password is wrong');
        valid = false;
    } else {
        valid = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,20}$/.test(password);
    }

    return valid;
}

function privacyPwdTerms() {
    alert("The username has to contain from 7 to 20 characters/numbers/underscore, starting with character.\n\nThe password has to contain from 7 to 20 characters, containing at least a number and special character");
}

function getCountriesLanguages() { //read from file and create option to selection html for each element
    var countrySelectElems = document.getElementById('countrySelection');
    var countryElemLen = countrySelectElems.childNodes.length;

    if (countryElemLen == 3) {
        var languageJson = {};
        for (var key in countryListNpm['languages']) {
            languageElem = countryListNpm['languages'][key];

            languageJson[key] = languageElem;
        }
        localStorage.setItem('languages', JSON.stringify(languageJson));

        var countriesJson = {};
        var countryElem = null;
        for (var key in countryListNpm['countries']) {
            if (countryListNpm['countries'][key]['name'] &&
                countryListNpm['countries'][key]['capital'] &&
                countryListNpm['countries'][key]['emoji'] &&
                countryListNpm['countries'][key]['continent']) {

                countriesJson[countryListNpm['countries'][key]['name']] = {
                    'capital': countryListNpm['countries'][key]['capital'],
                    'flag': countryListNpm['countries'][key]['emoji'],
                    'country': countryListNpm['countries'][key]['name'],
                }
            } else {
                continue;
            }

            countryElem = countryListNpm['countries'][key]['name'];
        }

        var optionElem = null;
        countryElem = null;
        var sortedCountries = sortByKey(countriesJson);
        for (var key in sortedCountries) {
            countryElem = sortedCountries[key]['country'];

            optionElem = document.createElement('option');
            optionElem.value = key;
            optionElem.innerHTML = sortedCountries[key]['flag'] + ' ' + countryElem;
            countrySelectElems.appendChild(optionElem);
        }


        localStorage.setItem('countries', JSON.stringify(countriesJson));
    }
}

//Quiz Functionality
function getGradeEmoji(gradePercentageQuiz){
    var emojiGrade = '';

    if (gradePercentageQuiz == 0) {
        emojiGrade = '🤫';
    } else if (gradePercentageQuiz <= 25) {
        emojiGrade = '😡';
    } else if (gradePercentageQuiz <= 50) {
        emojiGrade = '🤔';
    } else if (gradePercentageQuiz <= 75) {
        emojiGrade = '🤗';
    } else if (gradePercentageQuiz >= 95 && gradePercentageQuiz <= 99) {
        emojiGrade = '🤬';
    } else if (gradePercentageQuiz <= 100) {
        emojiGrade = '😱';
    }

    return emojiGrade
}

function getCountryArray(categoryKey, categoryValue) {
    var countriesJson = JSON.parse(localStorage.getItem('countries'));

    var countryInfoJson = {};
    var categoryKeyJson = {}

    var flagsArray = [];
    for (var key in countriesJson) {
        countryInfoJson = {};

        countryInfoJson = {
            [categoryKey]: countriesJson[key][categoryKey],
            [categoryValue]: countriesJson[key][categoryValue]
        }

        categoryKeyJson[countriesJson[key][categoryKey]] = countriesJson[key][categoryValue];

        flagsArray.push(countryInfoJson);
    }

    return [categoryKeyJson, flagsArray];
}

function getRandomCountry(countryArray) {
    var selectedCountry = Math.floor(Math.random() * countryArray.length);
    return selectedCountry;
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function createQuestion(categoryKey, categoryValue) {
    $('#quizQuestions').html('');

    var [flagsJson, flagsArray] = getCountryArray(categoryKey, categoryValue);

    var answersArray = null;
    var selectedCountryIndex = null;
    while (true) {
        selectedCountryIndex = getRandomCountry(flagsArray);

        if (flagsArray[selectedCountryIndex] != null) {
            break;
        }
    }

    if (questionsArray.length == 0) {
        questionsArray = JSON.parse(JSON.stringify(flagsArray));
    }

    delete questionsArray[selectedCountryIndex];

    answersArray = [];
    var answerSelected = null;
    for (var j = 0; j < 2; j++) {
        while (true) {
            answerSelected = getRandomCountry(questionsArray);

            if (questionsArray[answerSelected] && questionsArray[answerSelected][categoryKey]) {
                break;
            }
        }

        answersArray.push(questionsArray[answerSelected][categoryKey]);
    }

    var divElem = document.createElement('div');
    if (categoryKey == 'continent') {
        divElem.innerHTML = flagsArray[selectedCountryIndex][categoryKey];
    } else {
        divElem.innerHTML = flagsArray[selectedCountryIndex][categoryKey];
    }
    if (categoryKey == 'flag') {
        divElem.style = 'zoom: 500%; text-align: center';
    } else {
        divElem.style = 'font-size: 30px; color: red; text-align: center';
    }
    document.getElementById('quizQuestions').appendChild(divElem);

    var divElemSymbol = document.createElement('div');
    divElemSymbol.innerHTML = 'Which ' + categoryValue + ' belongs this ' + categoryKey + '?';
    divElemSymbol.style = 'text-align: center';
    document.getElementById('quizQuestions').appendChild(divElemSymbol);

    var labelElem = null;
    var inputElem = null;
    var brElem = null;
    answersArray.push(flagsArray[selectedCountryIndex][categoryKey]);

    var shuffledArray = shuffle(answersArray);
    for (var j = 0; j < shuffledArray.length; j++) {
        inputElem = document.createElement('input');
        inputElem.setAttribute('type', 'radio');
        inputElem.id = 'answer' + j;
        inputElem.name = 'quizAnswer';
        inputElem.value = flagsJson[shuffledArray[j]];

        labelElem = document.createElement('label');
        labelElem.setAttribute('for', 'answer' + j);
        labelElem.style = 'margin-left: 10px';
        labelElem.innerHTML = flagsJson[shuffledArray[j]];

        brElem = document.createElement('br');

        document.getElementById('quizQuestions').appendChild(inputElem);
        document.getElementById('quizQuestions').appendChild(labelElem);
        document.getElementById('quizQuestions').appendChild(brElem);
    }

    localStorage.setItem('correctAnswer', JSON.stringify(flagsArray[selectedCountryIndex]));
    return;
}

function checkAnswer(correctAnswer) {
    var answer = 0;

    var quizCategory = document.getElementsByName('quizAnswer');
    var checkedAnswer = null;
    for (var i = 0, length = quizCategory.length; i < length; i++) {
        if (quizCategory[i].checked) {
            checkedAnswer = quizCategory[i].value;
            break;
        }
    }

    if (checkedAnswer == correctAnswer['country']) {
        answer = 1;
    }

    return answer;
}

/*
* Sort JSON by key
*   https://smoothprogramming.com/javascript/sort-json-key-value-javascript/
*/
function sortByKey(jsObj) {
    var sortedArray = [];

    // Push each JSON Object entry in array by [key, value]
    for (var i in jsObj) {
        sortedArray.push([i, jsObj[i]]);
    }

    // Run native sort function and returns sorted array.
    var tmpArray = sortedArray.sort();
    var sortedJson = {};
    for (var i = 0; i < tmpArray.length; i++) {
        sortedJson[tmpArray[i][0]] = tmpArray[i][1];
    }

    return sortedJson;
}

/*
*   Bold text in js alert by converting a string into different kind of unicode variants
*       https://github.com/davidkonrad/toUnicodeVariant
*/
function toUnicodeVariant(str, variant, flags) {
    const offsets = {
        m: [0x1d670, 0x1d7f6],
        b: [0x1d400, 0x1d7ce],
        i: [0x1d434, 0x00030],
        bi: [0x1d468, 0x00030],
        c: [0x1d49c, 0x00030],
        bc: [0x1d4d0, 0x00030],
        g: [0x1d504, 0x00030],
        d: [0x1d538, 0x1d7d8],
        bg: [0x1d56c, 0x00030],
        s: [0x1d5a0, 0x1d7e2],
        bs: [0x1d5d4, 0x1d7ec],
        is: [0x1d608, 0x00030],
        bis: [0x1d63c, 0x00030],
        o: [0x24B6, 0x2460],
        p: [0x249C, 0x2474],
        w: [0xff21, 0xff10],
        u: [0x2090, 0xff10]
    }

    const variantOffsets = {
        'monospace': 'm',
        'bold': 'b',
        'italic': 'i',
        'bold italic': 'bi',
        'script': 'c',
        'bold script': 'bc',
        'gothic': 'g',
        'gothic bold': 'bg',
        'doublestruck': 'd',
        'sans': 's',
        'bold sans': 'bs',
        'italic sans': 'is',
        'bold italic sans': 'bis',
        'parenthesis': 'p',
        'circled': 'o',
        'fullwidth': 'w'
    }

    // special characters (absolute values)
    var special = {
        m: {
            ' ': 0x2000,
            '-': 0x2013
        },
        i: {
            'h': 0x210e
        },
        g: {
            'C': 0x212d,
            'H': 0x210c,
            'I': 0x2111,
            'R': 0x211c,
            'Z': 0x2128
        },
        o: {
            '0': 0x24EA,
            '1': 0x2460,
            '2': 0x2461,
            '3': 0x2462,
            '4': 0x2463,
            '5': 0x2464,
            '6': 0x2465,
            '7': 0x2466,
            '8': 0x2467,
            '9': 0x2468,
        },
        p: {},
        w: {}
    }
    //support for parenthesized latin letters small cases 
    for (var i = 97; i <= 122; i++) {
        special.p[String.fromCharCode(i)] = 0x249C + (i - 97)
    }
    //support for full width latin letters small cases 
    for (var i = 97; i <= 122; i++) {
        special.w[String.fromCharCode(i)] = 0xff41 + (i - 97)
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';

    var getType = function (variant) {
        if (variantOffsets[variant]) return variantOffsets[variant]
        if (offsets[variant]) return variant;
        return 'm'; //monospace as default
    }
    var getFlag = function (flag, flags) {
        if (!flags) return false
        return flags.split(',').indexOf(flag) > -1
    }

    var type = getType(variant);
    var underline = getFlag('underline', flags);
    var strike = getFlag('strike', flags);
    var result = '';

    for (var k of str) {
        let index
        let c = k
        if (special[type] && special[type][c]) c = String.fromCodePoint(special[type][c])
        if (type && (index = chars.indexOf(c)) > -1) {
            result += String.fromCodePoint(index + offsets[type][0])
        } else if (type && (index = numbers.indexOf(c)) > -1) {
            result += String.fromCodePoint(index + offsets[type][1])
        } else {
            result += c
        }
        if (underline) result += '\u0332' // add combining underline
        if (strike) result += '\u0336' // add combining strike
    }
    return result
}