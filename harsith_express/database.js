const mysql = require("mysql");

class Database {
	constructor() {
		this.client = mysql.createConnection({
		  host: "localhost",
		  username: "root",
		  password: "password",
		  database: "project",
		});
	}
}

//export default new Database().client;
module.exports = new Database().client;
