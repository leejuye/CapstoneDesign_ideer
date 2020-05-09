/* iDeer Module */

/* Module: PhotoTest
 */

Module.register("photo",{
	defaults: {
		text: "photo module test"
	},

	start: function() {
	 	this.current_user = null;

		// TEST
	 	/*this.sendSocketNotification("PREVIEW", "1231412421.jpg");
		var self = this;
		setTimeout(function() {
			self.sendNotification("COMPLIMENTS", "frontStart");
		}, 3000);*/
		// TEST END

	 	Log.info("Starting module: " + this.name);
	},

	socketNotificationReceived: function(notification, payload){
	 	if(notification === "SUCCESS"){
	 		this.config.imageSrc = "/modules/default/photo/image/" + payload.front + ".jpg";
			//this.config.imageSrc2 = "/modules/default/photo/image/" + payload.side + ".jpg";
		} else if(notification === "PREVIEW_DONE") {
			this.config.imageSrc = "/modules/default/photo/image/" + payload;
			this.sendNotification("COMPLIMENTS","frontResult");
			setTimeout(() => {
					this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC"});
			}, 5000)
		}
	 	this.updateDom();
	},

	notificationReceived: function (notification, payload, sender) {
		if(notification === "PYTHON_START"){
	 		Log.log(this.name + " received a 'module' notification: " + notification + " from sender: " + sender.name);
			this.sendSocketNotification("CONFIG", this.config);
	 	} else if(notification === "TAKE_PIC") {
			Log.log(this.name + " received a notification: TAKE_PIC");
			// payload : file name
			this.config.imageSrc = "";
			this.updateDom();
			this.sendNotification("COMPLIMENTS", "frontStart");
			this.sendSocketNotification("PREVIEW", payload);
		} else {
			Log.log(this.name + " received a 'system' notification: " + notification);
		}
	},

	getDom: function() {
		// var wrapper = document.createElement("div");
		// wrapper.innerHTML = this.config.text;
		var wrapper = document.createElement("img");
		wrapper.src = this.config.imageSrc;
		wrapper.className = "frontImg";

		/*var wrapper2 = document.createElement("img");
		wrapper2.src = this.config.imageSrc2;
		wrapper2.className = "sideImg";*/

		return wrapper;
	},

	getStyles: function() {
		return ["photo.css"];
	},

});
