const { ipcRenderer } = require('electron');
const L = require('leaflet');
var mysql = require('mysql');

require('leaflet.bigimage');
require('leaflet-sidebar-v2');

const fs = require('fs');
const readline = require('readline');
const path = require('path');

require('../node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.src.js');

window.$ = window.jQuery = require('../node_modules/jquery/dist/jquery.js');

$(document).ready(function () {
    $('#countrySubmit').on('click', () => {
        console.warn('geia');
    });

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

    const mymap = L.map('leafletMap', mapParameters).setView([0, 0], 1);
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

        enableUserInput: true,
    }).addTo(mymap);

    L.control.sidebar({
        autopan: true,       // whether to maintain the centered map point when opening the sidebar
        closeButton: true,    // whether t add a close button to the panes
        container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
        position: 'left',     // left or right
    }).addTo(mymap);

    getCountries();
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

function getCountries() { //read from file and create option to selection html for each element
    var countryForm = document.getElementById('countryForm');

    if (countryForm.innerHTML == '') {
        var labelElem = document.createElement('label');
        labelElem.setAttribute('for', 'selectCountry');
        countryForm.appendChild(labelElem);

        var selectElem = document.createElement('select');
        selectElem.setAttribute('class', 'form-select form-select-sm');
        selectElem.id = 'CountrySelection';

        const relativePath = path.join(__dirname, '../countries_codes_and_coordinates.csv');
        const streamFile = fs.createReadStream(relativePath);

        var stringArray = null;
        var optionElem = null;
        var countryElem = null;
        var reader = readline.createInterface({ input: streamFile });
        reader.on("line", (row) => {
            stringArray = row.split(",");
            optionElem = null;

            countryElem = stringArray[0].replace(/"/g, "");
            optionElem = document.createElement('option');
            if (countryElem.toLowerCase() != 'country') {
                optionElem.value = countryElem;
                optionElem.innerHTML = countryElem;
            } else {
                optionElem.selected = true;
                optionElem.value = 'selectCountry';
                optionElem.innerHTML = 'Select Country';
            }
            selectElem.appendChild(optionElem);
        });

        countryForm.appendChild(selectElem);
    }
}