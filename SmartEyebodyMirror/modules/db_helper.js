const mariadb = require("mariadb");
var dbInfo = require("./db_config");

const pool = mariadb.createPool({
	host: dbInfo.host, port:dbInfo.port,
	user: dbInfo.user, password: dbInfo.password,
	database: dbInfo.database, connectionLimit: 5
});

function dbHelper() {
	this.getConnection = async function() {
        	let conn;
	        try {
        	        conn = await pool.getConnection();
	        } catch(err) {
	                console.log("db connection fail");
	                throw err;
	        } finally {
	                return new Promise(function (resolve, reject) {
	                        resolve(conn);
			});
	        }
	};
}

module.exports = new dbHelper();
