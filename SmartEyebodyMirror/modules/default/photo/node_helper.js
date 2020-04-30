"use strict";
const NodeHelper = require("node_helper");

const {PythonShell} = require("python-shell");
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
		};
	}

});

