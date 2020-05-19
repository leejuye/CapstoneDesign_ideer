Module.register("hideshow",{

	// defaults: {
	// 	text: "Hello World!"
	// },

	// start: function() {
	// 	const self = this;
	// 	setTimeout(function() {
	// 		self.sendNotification("ASSISTANT_COMMAND", {
	// 			command: "SHUTDOWN_REQUEST"
	// 		 });
	// 	}, 2000);
	// 	setTimeout(function() {
	// 		self.sendNotification("ASSISTANT_COMMAND", {
	// 			command: "NO"
	// 		 });
	// 	}, 7000);
	// },

	notificationReceived: function (notification, payload, sender) {
		switch(notification) {
		case "HIDE_ALL_MODULES":
			Log.log(this.name + " received a module notification: " + notification + " payload: " + payload);
			this.sendNotification("COMPLIMENTS", "shutdownNow");
			const self = this;
			setTimeout(function() {
				self.sendNotification("CHANGE_POSITIONS",
					modules = {
						"compliments":{
							visible: "false",
							position: "",
						},
						"MMM-AssistantMk2":{
							visible: "false",
							position: "",
						},
						"photo":{
							visible: "false",
							position: "",
						},
						"clock":{
							visible: "false",
							position: "",
						},
					}
				);
			}, 5000);
			break;
		default:
			break;
		}
		// else if (notification === "ASSISTANT_ACTIVATE") {
		// 	this.sendNotification("CHANGE_POSITIONS",
		// 		modules = {
		// 			"compliments":{
		// 				visible: "true",
		// 				position: "center",
		// 			},
		// 			"MMM-AssistantMk2":{
		// 				visible: "true",
		// 				position: "top_left",
		// 			},
		// 			"clock":{
		// 				visible: "true",
		// 				position: "top_center",
		// 			},
		// 		}
		// 	);
		// }
	},
});
