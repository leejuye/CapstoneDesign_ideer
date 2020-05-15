const mariadb = require('mariadb');
var dbInfo = require('./db_config');

const pool = mariadb.createPool({
        host: dbInfo.host, port:dbInfo.port,
        user: dbInfo.user, password: dbInfo.password,
        database: dbInfo.database, connectionLimit: 5
});

function dbHelper() {
	this.getConnection = function(callback) {
		pool.getConnection()
			.then(conn => {
				callback(conn);
			}).catch(err => {
			console.log("db connection fail");
		});
	};
}

module.exports = new dbHelper();
