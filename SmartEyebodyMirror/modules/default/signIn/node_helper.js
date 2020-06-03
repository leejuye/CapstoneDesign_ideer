"use strict";
const NodeHelper = require("node_helper");
const dbHelper = require("../../db_helper");
const fs = require("fs");

module.exports = NodeHelper.create({
	dbConn: async function(qry, params) {
		var conn, results;
		try{
			conn = await dbHelper.getConnection();
			results = await conn.query(qry, params);
			console.log("RESULT:" + JSON.stringify(results));
		} catch(err) {
			this.sendSocketNotification("SIGN_IN_ERRER");
			console.log("ERROR!!!!!: " + err);
			throw err;
		} finally {
			if(conn) {conn.end();}
			return new Promise(function(resolve, reject){
				resolve(results[0]);
			});
		}
	},

	getUser: async function(payload, signIn=false) {
		const user = await this.dbConn("select * from users where name = ?", payload);
		if(signIn) {
			if(user) {this.sendSocketNotification("SIGN_IN_SUCCESS", user);}
			else {this.sendSocketNotification("NOT_EXIST", user.name);}
		}
		return new Promise(function(resolve, reject) {
			return resolve(user);
		});
	},

	createUser: async function(payload) {
		let user = await this.dbConn("insert into users (name) value (?)", payload);
		user = await this.getUser(payload, true);
		fs.mkdirSync("modules/default/photo/image/" + user.id);
	},

	socketNotificationReceived: async function(notification, payload) {
		if(notification === "CHECK_USER") {
			var user = await this.getUser(payload.name);
			if(user) {
				this.sendSocketNotification("ALREADY_EXIST", payload.name);
				if(!payload.isNew){this.getUser(payload.name, true);}
			} else {
				if (payload.isNew) {
					this.createUser(payload.name);
				} else {
					this.sendSocketNotification("NOT_EXIST", payload.name);
				}
			}
		} else if(notification === "SIGN_IN") {
			this.getUser(payload, true);
		}
	}
});
