Module.register("signIn",{

	start: function() {
		const self = this;
		setTimeout(function() {
			self.sendSocketNotification("SIGN_IN", "방주영");
		}, 5000);
	},

	notificationReceived: function (notification, payload) {
		switch(notification) {
		case "CHECK_NAME_IN_DB":
			Log.log(this.name + " received a module notification: " + notification + " payload: " + payload);
			this.sendSocketNotification("CHECK_USER", payload);
			break;
		case "SIGN_IN_USER":
			Log.log(this.name + " received a module notification: " + notification + " payload: " + payload);
			this.sendSocketNotification("SIGN_IN", payload);
			break;
		default:
			break;
		}
	},
	socketNotificationReceived: function(notification, payload) {
		if(notification === "ALREADY_EXIST") {
			this.sendNotification("COMPLIMENTS", "alreadyExistName");
		} else if (notification === "SIGN_IN_SUCCESS") {
			this.sendNotification("COMPLIMENTS", {payload: "signInSuccess", userName: payload.name});
			this.sendNotification("SIGN_IN_SUCCESS", payload);
		} else if (notification === "NOT_EXIST") {
			this.sendNotification("COMPLIMENTS", {payload: "notExistUserName", userName: payload.name});
		}
	}
});
