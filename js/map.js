const { ipcRenderer } = require('electron');
const L = require('leaflet');
var mysql = require('mysql');


require('../node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.src.js');
// require('..//node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.css');

require('leaflet.bigimage');

let username = null;
let gender = null;

const infoDB = {
    host: 'localhost',
    user: 'electronwebapp',
    password: 'electronwebAPP13!',
    database: 'electronwebappDB',
    table: 'users'
};

let con = getConnectionDB(infoDB['host'], infoDB['user'], infoDB['password'], infoDB['database']);

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

function GetUsername() {
    con.connect(function (err) {
        if (err) throw alert(err);

        // let sqlQuery = 'SELECT * FROM users WHERE username="' + usernameLogin + '"';
        let sqlQuery = 'SELECT * FROM users WHERE username="alex"'; //kapws na pairnw to onoma toy user!!!
        con.query(sqlQuery, function (err, result) {
            if (err) throw alert(err);

            username = result[0]['username'];
            gender = result[0]['gender'];

            document.getElementById('unameProfile').value = username;
            document.getElementById('genderProfile').value = gender;

            if (result[0]['gender'] == 'female') {
                document.getElementById('imgProfile').src = "../img/femaleProfile.png";
            } else if (result[0]['gender'] == 'other') {
                document.getElementById('imgProfile').src = "../img/otherProfile.png";
            }

            return result;
        });

    });
}

function disconnect() {
    ipcRenderer.send('changeWindow', 'main');
}

function profile() {
    if(document.getElementById('leafletMap') != null) document.getElementById('leafletMap').hidden = true;

    document.getElementById('profile').hidden = false;

    if (gender == "female") {
        document.getElementById('imgProfile').src = "../img/femaleProfile.png";
    } else if (gender == "other") {
        document.getElementById('imgProfile').src = "../img/otherProfile.png";
    }
}

function createMap() {
    document.getElementById('profile').hidden = true;

    var leafletMap = document.getElementById('leafletMap');
    if(leafletMap == null){
        var divElem = document.createElement('div');
        divElem.id = 'leafletMap';
        divElem.style = 'margin: 30px';
        divElem.hidden = false;

        document.getElementById('mapContainer').appendChild(divElem);
    }else{
        if(leafletMap.hidden == false) return;
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
        useDMS: true,
        useLatLngOrder: true,

        labelTemplateLat: 'Lat: {y}',
        labelTemplateLng: 'Lng: {x}',

        enableUserInput: false,

        // customLabelFcn: function (latLonObj, opts) { "Geohash: " + encodeGeoHash(latLonObj.lat, latLonObj.lng) }
    }).addTo(mymap);
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