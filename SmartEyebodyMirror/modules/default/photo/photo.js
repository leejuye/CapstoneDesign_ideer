/* iDeer Module */

/* Module: PhotoTest
 */

Module.register("photo",{
	defaults: {
		text: "photo module test"
	},
	fileName: null,
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

	fillZero: function(num, digits) {
		num = num.toString();
		var prefix = '';
		while(num.length + prefix.length < digits) {
			prefix += '0';
		}
		return prefix + num;
	},

	initFileName: function() {
		var d = new Date();
		this.fileName = this.fillZero(d.getFullYear(), 4) +
			this.fillZero(d.getMonth() + 1, 2) +
			this.fillZero(d.getDate(), 2) +
			this.fillZero(d.getHours(), 2) +
			this.fillZero(d.getMinutes(), 2) +
			this.fillZero(d.getSeconds(), 2);
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
			}, 8000)
		}
	 	this.updateDom();
	},

	notificationReceived: function (notification, payload, sender) {
		if(notification === "PYTHON_START"){
	 		Log.log(this.name + " received a 'module' notification: " + notification + " from sender: " + sender.name);
			this.sendSocketNotification("CONFIG", this.config);
	 	} else if(notification === "TAKE_PIC") {
			Log.log(this.name + " received a notification: " + notification);
			this.config.imageSrc = "";
			this.updateDom();
			this.initFileName();
			this.sendNotification("COMPLIMENTS", "frontStart");
			this.sendSocketNotification("PREVIEW", this.fileName + '_front.jpg');
		} else if (notification === "FRONT_RESULT") {
			Log.log(this.name + " received a 'system' notification: " + notification);
			if (payload === "tryAgain") {
				this.config.imageSrc = "";
				this.updateDom();
				this.sendNotification("COMPLIMENTS", "tryAgain");
				setTimeout(() => {
					this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC"});
				}, 10000)
			}
		} else if(notification === "TAKE_PIC_SIDE") {
			Log.log(this.name + " received a notification: " + notification);
			this.sendNotification("COMPLIMENTS", "sideStart");
			this.sendSocketNotification("PREVIEW", this.fileName + '_side.jpg');
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
