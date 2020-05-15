"use strict";
const NodeHelper = require("node_helper");
const {PythonShell} = require("python-shell");
const dbHelper = require('../../db_helper');
const fs = require('fs');

var pythonStarted = false;

module.exports = NodeHelper.create({
	numberOfFiles: function() {
		const execSync = require('child_process').execSync;
		const path = "/home/pi/CapstoneDesign_ideer/SmartEyebodyMirror/modules/default/photo/image/";
		const cmd = 'find ' + path + ' -type f -name "*_front.jpg" | wc -l';

		this.filenum = execSync(cmd);
		this.filenum = parseInt(this.filenum);
		console.log("filenumber: " + this.filenum);
		console.log("type: " + typeof(this.filenum));
	},

	dbTest: function() {
		dbHelper.getConnection(function(conn) {
			conn.query('select * from users')
				.then((results) => {
					console.log('@@@@result: ' + JSON.stringify(results));
				})
				.then((res) => {
					console.log('@@@@res = ' + JSON.stringify(res));
					conn.end();
				})
				.catch(err => {
					console.log('@@@@ERROR: ' + err);
					conn.end();
				})
		});
	},

	socketNotificationReceived: function(notification, payload) {
		if(notification === "PREVIEW") {
			var self = this;
			PythonShell.run("modules/default/photo/preview.py", {args: [payload]},
			function (err, result) {
				if (err) throw err;
				self.sendSocketNotification("PREVIEW_DONE",payload);
			});
		} else if(notification === "REMOVE_PIC") {
			fs.unlinkSync("modules/default/photo/image/" + payload);
		} else if(notification === "FILE_NUM") {
			this.numberOfFiles();
			this.sendSocketNotification("FILE_NUMBER", this.filenum);
		} else if(notification === "TEST") {
			this.dbTest();
		}
	}

});
