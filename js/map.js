const { ipcRenderer } = require('electron');
const L = require('leaflet');

require('../node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.src.js');
// require('../node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.css');

function disconnect() {
    ipcRenderer.send("changeWindow", "main");
}

function profile() {
    document.getElementById('leafletMap').hidden = true;
    document.getElementById('profile').hidden = false;

    document.getElementById('profileName').innerHTML='Alex';
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
        position: "bottomright", //optional default "bootomright"

        decimals: 2,
        decimalSeparator: '.',
        useDMS: true,
        useLatLngOrder: true,

        labelTemplateLat: 'Lat: {y}',
        labelTemplateLng: 'Lng: {x}',

        enableUserInput: false, //optional default true

        customLabelFcn: function(latLonObj, opts) { "Geohash: " + encodeGeoHash(latLonObj.lat, latLonObj.lng)} //optional default none
    }).addTo(mymap);


}
