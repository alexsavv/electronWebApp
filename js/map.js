const { ipcRenderer } = require('electron');
const L = require('leaflet');
var mysql = require('mysql');

require('leaflet.bigimage');
require('leaflet-sidebar-v2');

require('../node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.src.js');

const country = require('countries-list');
const currencyCountry = require('iso-country-currency');
const currencyList = require('currency-codes');

const countryjs = require('countryjs');

window.$ = window.jQuery = require('../node_modules/jquery/dist/jquery.js');

let mymap = null;

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

    $('#privacyTerms-changePwd-btn').on('click', () => {
        privacyTerms();
    });
    //End Password functionality

    $('#deleteUser').on('click', () => {
        deleteUser();
    });

    //Country Information
    $('#countrySubmit').on('click', () => {
        document.getElementById('countryData').innerHTML = '';

        var languagesJson = JSON.parse(localStorage.getItem('languages'));

        var countryHtmlElem = document.getElementById('countrySelection');
        var countryData = document.getElementById('countryData');

        var varString = '';
        var outputValue = '';

        var countryInfoJson = {};
        var preElem = document.createElement('pre');
        if (!countryjs.info(countryHtmlElem.value))  {
            outputValue = 'No Information for this country';

            varString = outputValue;

            preElem = document.createElement('pre');
            preElem.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;' + varString;

            countryData.appendChild(preElem);
            return;
        }

        countryInfoJson['name'] = countryjs.info(countryHtmlElem.value)['name'];
        countryInfoJson['nativeName'] = countryjs.info(countryHtmlElem.value)['nativeName'];
        countryInfoJson['capital'] = countryjs.info(countryHtmlElem.value)['capital'];
        countryInfoJson['population'] = countryjs.info(countryHtmlElem.value)['population'];

        countryInfoJson['region'] = countryjs.info(countryHtmlElem.value)['region'];
        countryInfoJson['subregion'] = countryjs.info(countryHtmlElem.value)['subregion'];

        countryInfoJson['languages'] = countryjs.info(countryHtmlElem.value)['languages'];

        countryInfoJson['callingCodes'] = countryjs.info(countryHtmlElem.value)['callingCodes'];
        countryInfoJson['currencies'] = countryjs.info(countryHtmlElem.value)['currencies'];
        countryInfoJson['timezones'] = countryjs.info(countryHtmlElem.value)['timezones'];

        countryInfoJson['latlng'] = countryjs.info(countryHtmlElem.value)['latlng']; //array two elements

        var countrySelected = country['countries'][countryHtmlElem.value];

        countryInfoJson['emoji'] = countrySelected['emoji'];

        for (var key in countryInfoJson) {
            if (key == 'latlng'){
                mymap.setView(countryInfoJson['latlng'], 5);
                continue;
            }

            outputValue = '';

            if (typeof (countryInfoJson[key]) == 'object') {
                for (var jKey in countryInfoJson[key]) {

                    if (key == 'languages') {
                        countryInfoJson[key][jKey] = languagesJson[countryInfoJson[key][jKey]]['name'] + ' (' + languagesJson[countryInfoJson[key][jKey]]['native'] + ')';
                    }
                    else if (key == 'currencies') {
                        countryInfoJson[key][jKey] = currencyList.code(countryInfoJson[key][jKey])['currency'] + ' (' + currencyCountry.getAllInfoByISO(countryHtmlElem.value)['symbol'] + ')';
                    }
                    outputValue += '<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + countryInfoJson[key][jKey];
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

                divCont.appendChild(divElemSymbol);
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
});

const infoDB = {
    host: 'localhost',
    user: 'electronwebapp',
    password: 'electronwebAPP13!',
    database: 'electronwebappDB',
    table: 'users'
};

let con = getConnectionDB(infoDB['host'], infoDB['user'], infoDB['password'], infoDB['database']);

let userInfo = {
    'username': localStorage.getItem('userID'),
    'gender': '',
    'profileImage': ''
}

GetUsername();

function getConnectionDB(host, user, password, database, table = null) {
    var con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: database
    });

    return con;
}

//get username, gender, profileImage
function GetUsername() {
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

            return result;
        });
    });
}

function disconnect() {
    document.getElementById('intro-login').hidden = false;
    document.getElementById('intro-info').disabled = true;

    document.getElementById('mapContainer').hidden = true;
    document.getElementById('mapFunctionality-btn').disabled = false;

    ipcRenderer.send('changeWindow', 'main');
}

function profile() {
    document.getElementById('unameProfile').value = userInfo['username'];
    document.getElementById('genderProfile').value = userInfo['gender'];

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
        for (var key in country['languages']) {
            languageElem = country['languages'][key];

            languageJson[key] = languageElem;
        }
        localStorage.setItem('languages', JSON.stringify(languageJson));

        var optionElem = null;
        var countryElem = null;
        for (var key in country['countries']) {
            countryElem = country['countries'][key]['name'];

            optionElem = document.createElement('option');
            optionElem.value = key;
            optionElem.innerHTML = country['countries'][key]['emoji'] + ' ' + countryElem;
            countrySelectElems.appendChild(optionElem);
        }
    }
}