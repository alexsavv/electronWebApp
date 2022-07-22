# electronWebApp with SQL database

This is a Electron Web Application with a SQL database interacting with Leaflet Map.

You can learn more about: <br/>
  &nbsp;&nbsp;&nbsp; [Electron.js framework ](https://electronjs.org/docs/latest/tutorial/quick-start) <br/>
  &nbsp;&nbsp;&nbsp; [SQL database](https://www.w3schools.com/sql/sql_intro.asp) <br/>
  &nbsp;&nbsp;&nbsp; [Leaflet](https://leafletjs.com/SlavaUkraini/examples/quick-start/) <br/>
   
## To Use

To clone and run this repository you'll need: <br/>
  &nbsp;&nbsp;&nbsp; [Git](https://git-scm.com) <br/>
  &nbsp;&nbsp;&nbsp; [Node.js](https://nodejs.org/en/download/)
  
You can run the project with the above commands from your command line:

```bash
# Clone this repository
git clone https://github.com/alexsavv/electronWebApp.git
# Go into the repository
cd electronWebApp
# Install dependencies
npm install
# Run the WebApp
npm start
```
<hr>

SQL installation
```bash
sudo apt update

sudo apt install mysql-server
sudo systemctl start mysql.service

##Set mySQL secure installation. Be carefull, it will be asked to set the password policy.
sudo mysql_secure_installation

##Login as root to mysql command line
mysql -u root -p
```
<hr>

Create SQL user with grand permissions (The host could be localhost)
```bash
CREATE USER '<username>'@'<host>' IDENTIFIED WITH mysql_native_password BY '<password>';
GRANT ALL PRIVILEGES ON *.* TO '<username>'@'<host>';
FLUSH PRIVILEGES;
```
<br>

Create Table users
```bash
CREATE TABLE users (
    username varchar(25),
    password varchar(25),
    gender varchar(25),
    UNIQUE (username)
);
```

<hr>

Usefull SQL commands
```bash
##check password policy
SHOW VARIABLES LIKE 'validate_password%';

##change validate password length
SET GLOBAL validate_password.length = 6;
```
