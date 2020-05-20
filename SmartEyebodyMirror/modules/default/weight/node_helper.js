"use strict";
const NodeHelper = require("node_helper");
const {PythonShell} = require("python-shell");
const cmd = require( "node-cmd" );

module.exports = NodeHelper.create({

	socketNotificationReceived: function(notification, payload) {
		if(notification === "START_GET_WEIGHT") {
			const self = this;
			cmd.get(
				"sudo python3 /home/pi/CapstoneDesign_ideer/SmartEyebodyMirror/modules/default/weight/ReverseMiScale/example.py"
				,function( error, success ) {
				  if( error ) {
						cmd.get(
							"sudo hciconfig hci0 down && sudo hciconfig hci0 up"
							,function( error, success ) {
								if( error ) {
									self.sendSocketNotification("GET_WEIGHT_ERROR", error);
								}
							}
						);
					} else {
						self.sendSocketNotification("GET_WEIGHT_SUCCESS", success);
				  }
				}
			);
		}
	}

});
