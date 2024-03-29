"use strict";
const NodeHelper = require("node_helper");
const {PythonShell} = require("python-shell");
const dbHelper = require('../../db_helper');
const fs = require('fs');

var pythonStarted = false;
const parts = ["id", "shoulder", "chest", "waist", "hip", "thigh", "calf",
	"weight", "height", "bmi", "is_front", "file_name"]

module.exports = NodeHelper.create({
	numberOfFiles: async function(id) {
		const execSync = require('child_process').execSync;
		const path = "/home/pi/CapstoneDesign_ideer/SmartEyebodyMirror/modules/default/photo/image/" + id + "/";
		const cmd = 'find ' + path + ' -type f -name "*_front.jpg" | wc -l';

		var filenum = await execSync(cmd);
		filenum = await parseInt(filenum);

		return new Promise(function(resolve, reject){
			resolve(filenum);
		});
	},

	saveFile: async function(id) {
		var saveFileNum = await this.numberOfFiles(id);
		this.sendSocketNotification("HERE_FILE_NUMBER", saveFileNum);
	},

	dbConn: async function(qry, params) {
		var conn, results;
		try{
			conn = await dbHelper.getConnection();
			results = await conn.query(qry, params);
			console.log('@@@@RESULT: ' + JSON.stringify(results));
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
	
	pixelToCm: function(data) {
		var h = 0.372;
		//var r = 0.4782;
		var r = 0.402985;
		for(var key in data) {
			if(key === "weight") {
				continue;
			} else if(key === "bmi") {
				data[key] /= (h*h);
			} else if(key === "height"){
				data[key] *= h;
			} else {
				data[key] *= r;
			}
		}
		return new Promise(function(resolve){
				resolve(data);
			});
	},

	getSizeInfo: async function(payload) {
		var fileNum = await this.numberOfFiles(payload.id);
		if(fileNum == 0) {
			this.sendSocketNotification("HERE_INFO", {
				"fileNum": fileNum
			});
			return;
		}

		let qry;

		var beforeFileName = await this.getBeforeFileName(payload.id);
		
		var afterFileName = await this.getAfterFileName(payload.id, payload.isFront, payload.term);
		
		if(payload.command === "prev") {
			qry = "SELECT DATE_FORMAT(MAX(file_name), '%Y%m%d%H%i%S') AS dfchange FROM size_info WHERE file_name < ? and id = ?";
			afterFileName = await this.dbConn(qry, [payload.rightFileName, payload.id]);
		} else if(payload.command === "next") {
			qry = "SELECT DATE_FORMAT(MIN(file_name), '%Y%m%d%H%i%S') AS dfchange FROM size_info WHERE file_name > ? and id = ?";
			afterFileName = await this.dbConn(qry, [payload.rightFileName, payload.id]);
		}
		
		if(payload.isFront) {
			qry = "SELECT shoulder,chest,waist,hip,thigh,calf,weight,height,bmi "
			+ "FROM size_info WHERE is_front = ? and file_name = ?";
		} else {
			qry = "SELECT chest,waist,hip,thigh,calf,weight,height,bmi "
			+ "FROM size_info WHERE is_front = ? and file_name = ?";
		}
		
		
		var beforeData = await this.dbConn(qry, [payload.isFront, beforeFileName]);
		beforeData = await this.pixelToCm(beforeData);
		
		if(afterFileName.hasOwnProperty("dfchange") && (afterFileName.dfchange === null)){
			this.sendSocketNotification("CHANGE_NULL", payload.command);
		} else {
			
			if(afterFileName.hasOwnProperty("dfchange")) {
				var afterData = await this.dbConn(qry, [payload.isFront, afterFileName.dfchange]);
				afterFileName = afterFileName.dfchange;
			} else {
				var afterData = await this.dbConn(qry, [payload.isFront, afterFileName]);
			}
			
			afterData = await this.pixelToCm(afterData);
			this.sendSocketNotification("HERE_INFO", {
				"beforeFileName": beforeFileName,
				"beforeData": beforeData,
				"afterFileName": afterFileName,
				"afterData": afterData,
				"isFront": payload.isFront,
				"fileNum": fileNum
			});
		}

	},

	getBeforeFileName: async function(id) {
		var qry = "SELECT base_file FROM users WHERE id = ?";
		var beforeFileName = await this.dbConn(qry, id);

		return new Promise(function(resolve, reject){
			resolve(beforeFileName.base_file);
		});
	},

	getAfterFileName: async function(id, isFront, term) {
		var qry = "SELECT DATE_FORMAT(file_name, '%Y%m%d%H%i%S') AS df FROM size_info "
			+ "WHERE id = ? and is_front = ? "
			+ "ORDER BY ABS(TIMESTAMPDIFF(SECOND, DATE_SUB(now(), INTERVAL ? DAY), file_name)) LIMIT 1";
		var afterFileName = await this.dbConn(qry, [id, isFront, term]);
		return new Promise(function(resolve, reject){
			resolve(afterFileName.df);
		});
	},

	setSizeInfo: async function(data) {
		const qry = "INSERT INTO size_info VALUES(?,?,?,?,?,?,?,?,?,?,?,?)";
		const params = [];
		
		//data = JSON.parse(data);

		for (var i in parts) {
			params.push(data[parts[i]]);
		}
		this.dbConn(qry, params);
	},

	deleteSizeInfo: function(data) {
		var qry = "DELETE FROM size_info WHERE file_name = ? and is_front = ?";
		var isFront = data.substring(15, data.length - 4) == "front" ? true : false;
		console.log("filename: " + data.substring(0, 14)+" annd :" + isFront);

		this.dbConn(qry, [data.substring(0, 14), isFront]);
	},

	changeBaseFile: function(id, fileName) {
		var qry = "UPDATE users SET base_file = ? WHERE id = ?";
		this.dbConn(qry, [fileName, id]);
		this.sendSocketNotification("CHANGE_COMPLETE", "complete");
	},
	
	setYpoints: function(id, ypoints) {
		var qry = "INSERT INTO ypoints VALUES(?,?,?,?,?,?,?)";
		console.log("^^^Ypoints" + ypoints);
		this.dbConn(qry, ypoints);
	},
	
	result: null,

	socketNotificationReceived: async function(notification, payload) {
		console.log("!!!!! noti: " + notification + " pay: " + payload);
		if(notification === "PREVIEW") {
			var self = this;
			PythonShell.run("modules/default/photo/preview.py", {args: [payload.fileName, payload.id]},
			function (err, result) {
				if (err) throw err;
				self.sendSocketNotification("PREVIEW_DONE", payload.fileName);
			});
		} else if(notification === "REMOVE_PIC") {
			fs.unlinkSync("modules/default/photo/image/" + payload.id + "/" + payload.fileName);
			this.deleteSizeInfo(payload.fileName);
		} else if(notification === "CONTOUR") {
			var num = await this.numberOfFiles(payload.id);
			var ob = {args: [payload.fileName, payload.id, payload.weight]};
			if(num >= 2) {
				var qry = "SELECT calf,thigh,hip,waist,chest,shoulder FROM ypoints "
					+ "WHERE id = ?";
				var result = await this.dbConn(qry, [payload.id]);
				
				for (var i in result) {
					ob.args.push(result[i]);
				}
			}
			
			var self = this;
			PythonShell.run("modules/default/photo/contour.py", ob,
			function (err, result) {
				if (err) {
					console.log(err);
					throw err;
				}
				console.log(result);
				self.result = JSON.parse(result);
				self.sendSocketNotification("CONTOUR_DONE");
			});
		} else if(notification === "GET_INFO") {
			this.getSizeInfo(payload);
		} else if(notification === "SET_INFO") {
			this.setSizeInfo(this.result.front);
			this.setSizeInfo(this.result.side);
			if(this.result.hasOwnProperty("ypoints")){
				this.setYpoints(payload.id, this.result.ypoints);
			}
			result = null;
		} else if(notification === "CHANGE_BASE") {
			this.changeBaseFile(payload.id, payload.fileName);
		} else if(notification === "GET_FILE_NUMBER") {
			this.saveFile(payload);
		}
	}
});
