"use strict";
const NodeHelper = require("node_helper");
const dbHelper = require("../../db_helper");

module.exports = NodeHelper.create({
	dbConn: async function(qry) {
		var conn, results;
		try{
			conn = await dbHelper.getConnection();
			results = await conn.query(qry);
		} catch(err) {
			this.sendSocketNotification("SIGN_IN_ERRER");
			throw err;
		} finally {
			if(conn) {conn.end();}
			return new Promise(function(resolve, reject){
				resolve(results[0]);
			});
		}
	},

	getUser: async function(payload, signIn=false) {
		const user = await this.dbConn("select * from users where name = '"+payload+"'");
		if(signIn) {
			if(user) {this.sendSocketNotification("SIGN_IN_SUCCESS", user);}
			else {this.sendSocketNotification("NOT_EXIST");}
		}
	},

	createUser: async function(payload) {
		const user = await this.dbConn("insert into users (name) value ('"+payload+"')");
		this.getUser(payload, true);
	},

	socketNotificationReceived: function(notification, payload) {
		if(notification === "CHECK_USER") {
			var user = this.getUser(payload);
			if(user) {
				this.sendSocketNotification("ALREADY_EXIST");
			} else {
				this.createUser(payload);
				user = this.getUser(payload, true);
			}
		} else if (notification === "SIGN_IN") {
			this.getUser(payload, true);
		}
	}

});
