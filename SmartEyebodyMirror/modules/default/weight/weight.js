Module.register("weight",{

	start: function() {
		this.sendStart();
	},

	sendStart: function() {
		this.sendSocketNotification("START_GET_WEIGHT");
	},
	notificationReceived: function (notification, payload) {
		switch(notification) {
		case "RESTART_GET_WEIGHT":
			Log.log(this.name + " received a module notification: " + notification + " payload: " + payload);
			this.sendSocketNotification("START_GET_WEIGHT");
			break;
		case "SHUTDOWN_MIRROR":
			Log.log(this.name + " received a module notification: " + notification + " payload: " + payload);
			this.sendNotification("COMPLIMENTS", "shutdownNow");
			setTimeout(() => {
				this.sendNotification("PAGE_CHANGED", 0);
			}, 5000);
			break;
		default:
			break;
		}
	},
	socketNotificationReceived: function(notification, payload) {
		if(notification === "GET_WEIGHT_SUCCESS") {
			Log.log(payload);
			this.sendNotification("START_MIRROR");
			this.sendNotification("PAGE_CHANGED", 2);
			setTimeout(() => {
				this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC", isName: true});
			}, 8000);
		} else if (notification === "GET_WEIGHT_ERROR") {
			this.sendNotification("COMPLIMENTS", "getWeightError");
		}
	}
});
