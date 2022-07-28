# electronWebApp with SQL database

An Electron Web App with SQL database in which the user can interact with Leaflet Map and learn countries' information. 
There is also country quiz with flags and capitals. This application has been implemented with JavaScript, HTML, CSS, JQuery, bootstrap, Node.js, SQL Database.

You can run this application with or not SQL database. There is a question in the start of the application in order to check if you prefer or not database.

You can learn more about: <br/>
  &nbsp;&nbsp;&nbsp; [Electron.js framework ](https://electronjs.org/docs/latest/tutorial/quick-start) <br/>
  &nbsp;&nbsp;&nbsp; [SQL database](https://www.w3schools.com/sql/sql_intro.asp) <br/>
  &nbsp;&nbsp;&nbsp; [Leaflet](https://leafletjs.com/SlavaUkraini/examples/quick-start/) <br/>
   
## To Use [Linux System]

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

You have to create user and database with SQL commands, if yoy prefer to use database in electronwebapp.

Create SQL user with grand permissions (The host could be localhost)
```bash
##Login to sql shell as root user
mysql -u root -p


##Create user with grant permissions
CREATE USER '<username>'@'<host>' IDENTIFIED WITH mysql_native_password BY '<password>';
GRANT ALL PRIVILEGES ON *.* TO '<username>'@'<host>';
FLUSH PRIVILEGES;
```
Create Database to specific user
```bash
mysql -u <sql user> -p

CREATE DATABASE <database name>;
```
