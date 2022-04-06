const { ipcRenderer } = require('electron');
const L = require('leaflet');
var mysql = require('mysql');

require('../node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.src.js');
// require('../node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.css');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'electronwebapp',
    password: 'electronwebapp',
    database: 'electronwebappDB'
});

let username=null;
let gender=null;
GetUsername();

if (username) document.getElementById('username').value = username;

function GetUsername() {
    con.connect(function (err) {
        if (err) throw alert(err);

        // let sqlQuery = 'SELECT * FROM users WHERE username="' + usernameLogin + '"';
        let sqlQuery = 'SELECT * FROM users WHERE username="alex"'; //kapws na pairnw to onoma toy user!!!
        var result = con.query(sqlQuery, function (err, result) {
            if (err) throw alert(err);

            username = result[0]['username'];
            gender = result[0]['gender'];

            if (result[0]['gender'] == 'female') {
                document.getElementById('imgProfile').src = "../img/femaleProfile.png";
            } else if (result[0]['gender'] == 'other') {
                document.getElementById('imgProfile').src = "../img/otherProfile.png";
            }
        });
    });
}

function disconnect() {
    ipcRenderer.send('changeWindow', 'main');
}

function profile() {
    document.getElementById('leafletMap').hidden = true;
    document.getElementById('profile').hidden = false;

    document.getElementById('unameProfile').value = username;
    document.getElementById('genderProfile').value = gender;

    if (result[0]['gender'] == "female") {
        document.getElementById('imgProfile').src = "../img/femaleProfile.png";
    } else if (result[0]['gender'] == "other") {
        document.getElementById('imgProfile').src = "../img/otherProfile.png";
    }
}

function createMap() {
    document.getElementById('profile').hidden = true;
    document.getElementById('leafletMap').hidden = false;

    const mymap = L.map('leafletMap', { worldCopyJump: true }).setView([0, 0], 1);
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright"> \
        OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'map',
    }).addTo(mymap);
    mymap.setView([37, 25], 8);

    L.control.coordinates({
        position: 'bottomright',

        decimals: 2,
        decimalSeparator: '.',
        useDMS: true,
        useLatLngOrder: true,

        labelTemplateLat: 'Lat: {y}',
        labelTemplateLng: 'Lng: {x}',

        enableUserInput: false,

        customLabelFcn: function (latLonObj, opts) { "Geohash: " + encodeGeoHash(latLonObj.lat, latLonObj.lng) }
    }).addTo(mymap);
}
