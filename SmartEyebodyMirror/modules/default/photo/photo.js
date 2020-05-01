/* iDeer Module */

/* Module: PhotoTest
 */

Module.register("photo",{
	defaults: {
		text: "photo module test",
		imageSrc: "/modules/default/photo/image/background.jpg",
	},

	start: function() {
	 	this.current_user = null;
	 	// this.sendSocketNotification("CONFIG", this.config);
	 	Log.info("Starting module: " + this.name);
	},

	socketNotificationReceived: function(notification, payload){
	 	if(notification === "SUCCESS"){
	 		this.config.imageSrc = "/modules/default/photo/image/" + payload + ".jpg";
	 	}
	 	this.updateDom();
	},

	notificationReceived: function (notification, payload, sender) {
		if(notification === "PYTHON_START"){
	 		Log.log(this.name + " received a 'module' notification: " + notification + " from sender: " + sender.name);
			this.sendSocketNotification("CONFIG", this.config);
		} else {
			Log.log(this.name + " received a 'system' notification: " + notification);
		}
	},

	getDom: function() {
		// var wrapper = document.createElement("div");
		// wrapper.innerHTML = this.config.text;
		var wrapper = document.createElement("img");
		wrapper.src = this.config.imageSrc;
		wrapper.className = this.name;
		return wrapper;
	},

	getStyles: function() {
		return ["photo.css"];
	},

});
