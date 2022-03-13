const { ipcRenderer } = require('electron');
var mysql = require('mysql');

// let mysqlConnection = "aa";
// module.exports = {mysqlConnection};

function checkExistDB() {
    var host = document.getElementById('hostSql').value;
    var username = document.getElementById('unameSql').value;
    var pwd = document.getElementById('pwdSql').value;
    var database = document.getElementById('dbSql').value;

   let mysqlConnection1 = mysql.createConnection({
        host: host,
        user: username,
        password: pwd,
        database: database
    });

    //Delay because mysql con is asynchronous
    var i=0;
    while(i<1500){
        console.warn(i);
        i++;
    }

    mysqlConnection1.connect(function (err) {
        if (err) throw alert('Den yparxei basi me ta stoixeia poy edwses');
        ipcRenderer.send('changeWindow', 'sqlTomain');
    });

    // module.exports = mysqlConnection1;
}