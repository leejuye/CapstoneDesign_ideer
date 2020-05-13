"use strict";
const NodeHelper = require("node_helper");
const {PythonShell} = require("python-shell");
const fs = require('fs');

var pythonStarted = false;

module.exports = NodeHelper.create({

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
		}
	}

});

