"use strict";
const NodeHelper = require("node_helper");
const {PythonShell} = require("python-shell");
const dbHelper = require('../../db_helper');
const fs = require('fs');

var pythonStarted = false;

module.exports = NodeHelper.create({
	numberOfFiles: async function(payload) {
		console.log('@@@@numberOfFiles@@@@@');
			const execSync = require('child_process').execSync;
			const path = "/home/pi/CapstoneDesign_ideer/SmartEyebodyMirror/modules/default/photo/image/";
			const cmd = 'find ' + path + ' -type f -name "*_front.jpg" | wc -l';

			this.filenum = await execSync(cmd);
			this.filenum = await parseInt(this.filenum);
			console.log(this.filenum);
			
			if(payload === "recall") {
				this.sendSocketNotification("FILE_NUMBER_CALL", this.filenum);
			} else if(payload === "save") {
				this.sendSocketNotification("FILE_NUMBER_SAVE", this.filenum);
			}
	},
	
	dbConn: async function(qry, params) {
		var conn, results;
		try{
			conn = await dbHelper.getConnection();
			results = await conn.query(qry, params);
			console.log('@@@@RESULT: ' + JSON.stringify(results[0]));
		} catch(err) {
			console.log('@@@@ERROR: ' + err);
			throw err;
		} finally {
			if(conn) conn.end();
			return new Promise(function(resolve, reject){
				resolve(results[0]);
			});
		}
	},

	getSizeInfo: async function(payload) {
		var qry = "SELECT shoulder,chest,waist,hip,thigh,calf,weight,bmi "
			+ "FROM size_info WHERE is_front = ? and file_name = ?";
		var beforeData = await this.dbConn(qry, [payload.isFront, payload.beforeFileName]);
		var afterData = await this.dbConn(qry, [payload.isFront, payload.afterFileName]);
		this.sendSocketNotification("HERE_INFO", {
			"beforeFileName": payload.beforeFileName,
			"beforeData": beforeData,
			"afterFileName": payload.afterFileName,
			"afterData": afterData,
			"isFront": payload.isFront
		});

	},
	
	dbGetBeforeFileName: async function(payload) {
		var qry = "SELECT base_file from users WHERE id = ?";
		var beforeFileName = await this.dbConn(qry, payload);
		this.sendSocketNotification("HERE_BEFORE_FILENAME", beforeFileName);
	},
	
	dbGetAfterFileName: async function(payload) {
		var qry = "SELECT DATE_FORMAT(file_name, '%Y%m%d%H%i%S') FROM size_info WHERE id = 1 ORDER BY ABS(TIMESTAMPDIFF(SECOND, DATE_ADD(now(), INTERVAL ? DAY), file_name)) LIMIT 1";
		//var qry = "SELECT DATE_FORMAT(date, '%Y%m%d%H%i%S') FROM size_info WHERE id = 1 ORDER BY ABS(TIMESTAMPDIFF(SECOND, DATE_ADD(now(), INTERVAL ? DAY), date)) LIMIT 1";
		var afterFileName = await this.dbConn(qry, [payload.id, payload.term]);
		this.sendSocketNotification("HERE_AFTER_FILENAME", afterFileName);
	},
	
	socketNotificationReceived: function(notification, payload) {
		if(notification === "PREVIEW") {
			var self = this;
			PythonShell.run("modules/default/photo/preview.py", {args: [payload]},
			function (err, result) {
				console.log('########################' + result);
				if (err) throw err;
				self.sendSocketNotification("PREVIEW_DONE",payload);
			});
		} else if(notification === "REMOVE_PIC") {
			fs.unlinkSync("modules/default/photo/image/" + payload);
		} else if(notification === "FILE_NUM") {
			this.numberOfFiles(payload);
		} else if(notification === "GET_INFO") {
			this.getSizeInfo(payload);
		} else if(notification === "TEST") {
			this.dbConn("select * from size_info");	
		} else if(notification === "GET_BEFORE_FILENAME") {
			this.dbGetBeforeFileName(payload);
		} else if(notification === "GET_AFTER_FILENAME") {
			this.dbGetAfterFileName(payload);
		}
	}

});
