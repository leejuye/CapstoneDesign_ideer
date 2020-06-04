Module.register("signIn",{
	isNew: false,

	notificationReceived: function (notification, payload) {
		switch(notification) {
		case "CHECK_NAME_IN_DB":
			Log.log("^^^^^^"+this.name + " received a module notification: " + notification + " payload: " + payload);
			this.sendSocketNotification("CHECK_USER", {name: payload, isNew: this.isNew} );
			break;
		case "SIGN_IN_USER":
			Log.log(this.name + " received a module notification: " + notification + " payload: " + payload);
			this.sendSocketNotification("SIGN_IN", payload);
			break;
		case "COMPLIMENTS":
			if(payload === "signUpRequest") {
				this.isNew = true;
			}
			break;
		case "CHECK_NAME_NO":
			Log.log(this.name + " received a module notification: " + notification + " payload: " + payload);
			if(this.isNew) {
				this.sendNotification("ASSISTANT_COMMAND", {
					command: "SIGN_UP_REQUEST"
				});
			} else {
				this.sendNotification("COMPLIMENTS", "sayName");
			}
			break;
		case "LOGOUT_REQUEST":
			Log.log(this.name + " received a module notification: " + notification + " payload: " + payload);
			this.sendNotification("COMPLIMENTS", "logOutSuccess");
			this.sendNotification("PHOTO", "LOGOUT");
			break;
		default:
			break;
		}
	},
	socketNotificationReceived: function(notification, payload) {
		if(notification === "ALREADY_EXIST") {
			if (this.isNew) {
				this.sendNotification("COMPLIMENTS", "alreadyExistName");
			} else {
				this.sendSocketNotification("SIGN_IN", payload);
			}
		} else if (notification === "SIGN_IN_SUCCESS") {
			this.sendNotification("COMPLIMENTS", {payload: "signInSuccess", userName: payload.name});
			this.sendNotification("SIGN_IN_INFO", payload);
			this.isNew = false;
		} else if (notification === "NOT_EXIST") {
			this.sendNotification("COMPLIMENTS", "notExistUserName");
		}
	}
});
