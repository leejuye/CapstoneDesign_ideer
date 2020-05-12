"use strict";
const NodeHelper = require("node_helper");
const {PythonShell} = require("python-shell");
const fs = require('fs');

var pythonStarted = false;

module.exports = NodeHelper.create({

	python_start: function () {
		const self = this;
		const pyshell = new PythonShell("modules/default/" + self.name + "/test.py",
			{ mode: "json", args: [JSON.stringify(this.config)]});

		pyshell.on("message", function (message) {
			if (message.hasOwnProperty("front") && message.hasOwnProperty("side")){
				console.log("[" + self.name + "] " + "User " + message.front);
				console.log("[" + self.name + "] " + "User " + message.side);
				self.sendSocketNotification("SUCCESS", message);
			}
		});
		pyshell.end(function (err) {
			if (err) {throw err;}
			console.log("[" + self.name + "] " + "finished running...");
		});
	},

	socketNotificationReceived: function(notification, payload) {
		if(notification === "CONFIG") {
			this.config = payload;
			if(!pythonStarted) {
				pythonStarted = true;
				this.python_start();
			};
		} else if(notification === "PREVIEW") {
			var self = this;
			PythonShell.run("modules/default/photo/preview.py", {args: [payload]},
			function (err, result) {
				if (err) throw err;
				console.log("RERERERERERERE");
				self.sendSocketNotification("PREVIEW_DONE",payload);
			});
		} else if(notification === "REMOVE_PIC") {
			fs.unlinkSync("modules/default/photo/image/" + payload);
		}
	}

});

