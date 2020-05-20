Module.register("weight",{

	start: function() {
		this.sendSocketNotification("START_GET_WEIGHT");
	},
	// notificationReceived: function (notification, payload) {
	// 	switch(notification) {
	// 	case "CHECK_NAME_IN_DB":
	// 		Log.log(this.name + " received a module notification: " + notification + " payload: " + payload);
	// 		this.sendSocketNotification("CHECK_USER", payload);
	// 		break;
	// 	case "SIGN_IN_USER":
	// 		Log.log(this.name + " received a module notification: " + notification + " payload: " + payload);
	// 		this.sendSocketNotification("SIGN_IN", payload);
	// 		break;
	// 	default:
	// 		break;
	// 	}
	// },
	socketNotificationReceived: function(notification, payload) {
		if(notification === "GET_WEIGHT_SUCCESS") {
			Log.log(payload);
			this.sendNotification("START_MIRROR");
			setTimeout(() => {
				this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC", isName: true});
			}, 8000);
		} else if (notification === "GET_WEIGHT_ERROR") {
			this.sendNotification("COMPLIMENTS", "getWeightError");
		}
	}
});
