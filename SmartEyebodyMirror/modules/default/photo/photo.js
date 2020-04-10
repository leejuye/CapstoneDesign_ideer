/* iDeer Module */

/* Module: PhotoTest
 */

Module.register("photo",{
	defaults: {
		text: "photo module test",
		imageSrc: "/modules/default/photo/front.jpg",
	},

	socketNotificationReceived: function(notification, payload){
	 	if(notification === "SUCCESS"){
	 		this.config.text = payload;
	 	}
	 	this.updateDom();
	},

	start: function() {
	 	this.current_user = null;
	 	this.sendSocketNotification("CONFIG", this.config);
	 	Log.info("Starting module: " + this.name);
	},

	getDom: function() {
		// var wrapper = document.createElement("div");
		// wrapper.innerHTML = this.config.text;
		var wrapper = document.createElement("img");
		wrapper.src = this.config.imageSrc;
		return wrapper;
	}
});
