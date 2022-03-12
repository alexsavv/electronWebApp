const { ipcRenderer } = require("electron");
var mysql = require('mysql');

function checkExistDB() {
    var host = document.getElementById("hostSql").value;
    var username = document.getElementById("unameSql").value;
    var pwd = document.getElementById("pwdSql").value;
    var database = document.getElementById("dbSql").value;

    const con1 = mysql.createConnection({
        host: host,
        user: username,
        password: pwd
    });

    con1.connect(function (err) {
        if (err) throw ipcRenderer.send("changeWindow", "sqlTosql");
        // alert("Den yparxei syndesi sti mysql me to host poy edwses")
        
        let sqlQuery = "use " + database;
        con1.query(sqlQuery, function (err, result) {
            if (err) throw ipcRenderer.send("changeWindow", "sqlTosql");
            //alert("Den yparxei basi me to onoma poy edwses");
            ipcRenderer.send("changeWindow", "sqlTomap");
            
            con1.destroy();
        });
    });
}