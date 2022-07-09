const { ipcRenderer } = require('electron');
const L = require('leaflet');
var mysql = require('mysql');

require('leaflet.bigimage');
require('leaflet-sidebar-v2');

const fs = require('fs');
const readline = require('readline');
const path = require('path');

require('../node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.src.js');
// require('../node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.css');


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
    document.getElementById('profile').hidden = true;
    if (document.getElementById('leafletMap') != null) document.getElementById('leafletMap').hidden = false;

    ipcRenderer.send('changeWindow', 'main');
}

function profile() {
    if (document.getElementById('leafletMap') != null) document.getElementById('leafletMap').hidden = true;

    document.getElementById('profile').hidden = false;

    document.getElementById('unameProfile').value = userInfo['username'];
    document.getElementById('genderProfile').value = userInfo['gender'];

    document.getElementById('imgProfile').src = userInfo['profileImage'];
}

function createMap() {
    document.getElementById('profile').hidden = true;

    var leafletMap = document.getElementById('leafletMap');
    if (leafletMap == null) {
        var divElem = document.createElement('div');
        divElem.id = 'leafletMap';
        divElem.style = 'margin: 30px';
        divElem.hidden = false;

        document.getElementById('mapContainer').appendChild(divElem);
    } else {
        if (leafletMap.hidden == false) return;
        leafletMap.hidden = false;
        return;
    }

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

    L.control.BigImage({}).addTo(mymap);

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

        // customLabelFcn: function (latLonObj, opts) { "Geohash: " + encodeGeoHash(latLonObj.lat, latLonObj.lng) }
    }).addTo(mymap);

    // var sidebar = L.control.sidebar({
    //     autopan: true,       // whether to maintain the centered map point when opening the sidebar
    //     closeButton: true,    // whether t add a close button to the panes
    //     container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
    //     position: 'left',     // left or right
    // }).addTo(mymap);

    getCountries();
}

function removeUser() {
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
    document.getElementById('rePwd').disabled = value;
    document.getElementById('showRePwd').disabled = value;
    document.getElementById('submitRePwd').disabled = value;

    document.getElementById('editRePwd').disabled = !value;
}

function submitPwd() {
    var rePwdValue = document.getElementById('rePwd').value;

    if (rePwdValue == null || rePwdValue == '') {
        window.alert('Please give me a new password');
        editRePassword(true);
        return;
    } else {
        var confirmChangePwd = window.confirm('Are you sure that you want to change the user\'s password');
        if (!confirmChangePwd) {
            editRePassword(true);
            return;
        }
    }

    rePwdValue = document.getElementById('rePwd').value;

    let sqlQuery = 'UPDATE ' + infoDB['table'] + ' SET password = "' + rePwdValue + '" WHERE username = "' + username + '";';
    con.query(sqlQuery, function (err, result) {
        if (err) throw alert(err);

        return result;
    });

    document.getElementById('rePwd').value = '';
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

function getCountries() { //read from file and create option to selection html for each element
    var countryForm = document.getElementById('countryForm');

    if (countryForm.hidden) {
        var labelElem = document.createElement('label');
        labelElem.innerHTML = 'CountrySelection';
        labelElem.setAttribute('for', 'selectCountry');
        countryForm.appendChild(labelElem);

        var selectElem = document.createElement('select');

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
            if (countryElem.toLowerCase() != 'country') {
                optionElem = document.createElement('option');
                optionElem.value = countryElem;
                optionElem.innerHTML = countryElem;
                selectElem.appendChild(optionElem);
            }
        });

        countryForm.appendChild(selectElem);
        countryForm.hidden = false;
    }
}