/* iDeer Module */

/* Module: PhotoTest
 */

Module.register("photo",{
	defaults: {
		text: "photo module test",
		// imageSrc = "./background.jpg"
	},

	socketNotificationReceived: function(notification, payload) {
		if (payload.action == "status"){
			this.config.text = "lululu";
			console.log(payload);
		}
		else{
			console.log("No.....");
		}
	},

	start: function() {
		this.current_user = null;
		this.sendSocketNotification("CONFIG", this.config);
		Log.info("Starting module: " + this.name);
	},

	getDom: function() {
		// var wrapper = document.createElement('img');
		// wrapper.src = this.config.imageSrc;
		var wrapper = document.createElement("div");
		wrapper.innerHTML = this.config.text;
		return wrapper;
	}
});
