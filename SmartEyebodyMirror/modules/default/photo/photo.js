/* iDeer Module */

/* Module: PhotoTest
 */

Module.register("photo",{
	defaults: {
		text: "photo module test",
		imageSrc: ""
	},
	fileName: null,
	fileNameSuffix: null,
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

	initImage: function() {
		this.config.imageSrc = "";
		this.updateDom();
	},

	socketNotificationReceived: function(notification, payload){
		if(notification === "PREVIEW_DONE") {
			this.config.imageSrc = "/modules/default/photo/image/" + payload;
			if(payload.indexOf("front") != -1) {
				Log.log("front result");
				this.sendNotification("COMPLIMENTS","frontResult");
			} else {
				this.sendNotification("COMPLIMENTS","sideResult");
			}
			setTimeout(() => {
				this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC"});
			}, 8000)
		}
	 	this.updateDom();
	},

	notificationReceived: function (notification, payload, sender) {
		if(notification === "PHOTO") {
			Log.log(this.name + "received a notification: " + notification + ", payload : " + payload);
		 	this.initImage();

			switch(payload) {
			case "TAKE_PIC":
				this.initFileName();
				this.fileNameSuffix = '_front.jpg'

				this.sendNotification("COMPLIMENTS", "frontStart");
				this.sendSocketNotification("PREVIEW", this.fileName + this.fileNameSuffix);
				break;
			case "tryAgain":
				this.sendSocketNotification("REMOVE_PIC", this.fileName + '_front.jpg');
				this.sendNotification("COMPLIMENTS", "tryAgain");
				setTimeout(() => {
					this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC"});
				}, 10000);
				break;
			case "TAKE_PIC_SIDE":
				this.fileNameSuffix = '_side.jpg';

				this.sendNotification("COMPLIMENTS", "sideStart");
				this.sendSocketNotification("PREVIEW", this.fileName + this.fileNameSuffix);
				break;
			case "noKeyword":
				this.sendNotification("COMPLIMENTS", "noKeyword");
				break;
			case "noResponse":
				this.sendNotification("COMPLIMENTS", "noResponse");
				break;
			case "dressCheck":
				this.sendNotification("COMPLIMENTS", "dressCheck");
				break;
			case "dressWait":
				this.sendNotification("COMPLIMENTS", "dressWait");
				break;
			}
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
