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
	whatPage: null,
	start: function() {
	 	this.current_user = null;

		// TEST
	 	/*this.sendSocketNotification("PREVIEW", "1231412421.jpg");
		var self = this;
		setTimeout(function() {
			self.sendNotification("COMPLIMENTS", "frontStart");
		}, 3000);*/
		// TEST END

		//this.fileName = "1234";
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
		this.whatPage = null;
		this.updateDom();
	},

	socketNotificationReceived: function(notification, payload){
		if(notification === "PREVIEW_DONE") {
			this.config.imageSrc = "/modules/default/photo/image/" + payload;
			if(payload.indexOf("front") != -1) {
				Log.log("front result");
				this.sendNotification("COMPLIMENTS","frontResult");
			}else {
				this.sendNotification("COMPLIMENTS","sideResult");
			}
			setTimeout(() => {
					this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC"});
			}, 8000)
		} else if(notification === "FILE_NUMBER") {
			this.sendNotification("COMPLIMENTS", {"payload": "savePicture", "number": payload});
		}
	 	this.updateDom();
	},

	notificationReceived: function(notification, payload, sender) {
		if(notification === "PHOTO") {
			Log.log(this.name + "received a notification: " + notification + ", payload : " + payload);
		 	this.initImage();

			switch(payload) {
			case "TAKE_PIC":
				this.initFileName();
				this.fileNameSuffix = '_front.jpg';
				this.sendNotification("COMPLIMENTS", "frontStart");
				this.sendSocketNotification("PREVIEW", this.fileName + this.fileNameSuffix);
				break;
			case "tryAgain":
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
			case "VOICE_ERROR":
				this.sendNotification("COMPLIMENTS", "noKeyword");
				break;
			case "RE_TAKE_PIC":
				if(this.fileNameSuffix === '_front.jpg'){
					this.initFileName();
					this.sendNotification("COMPLIMENTS", "frontStart");
				} else {
					this.sendNotification("COMPLIMENTS", "sideStart");
				}
				this.sendSocketNotification("REMOVE_PIC", this.fileName + this.fileNameSuffix);
				this.sendSocketNotification("PREVIEW", this.fileName + this.fileNameSuffix);
				break;
			case "SHOW_RESULT":
				this.whatPage = "resultPage";
				this.updateDom();
				this.sendNotification("COMPLIMENTS", "savePictureOrNot");
				break;
			case "REMOVE_RESULT":
				this.sendSocketNotification("REMOVE_PIC", this.fileName + "_front.jpg");
				this.sendSocketNotification("REMOVE_PIC", this.fileName + "_side.jpg");
				break;
			case "SHOW_COMPARE":
				this.whatPage = "comparePage";
				this.updateDom();
				break;
			case "COUNT_FILE":
				this.sendSocketNotification("FILE_NUM", payload);
				break;
			}
		}
	},

	drawResultPage: function() {
		var wrapper = document.createElement("div");
		var img1 = document.createElement("img");
                img1.src = "/modules/default/photo/image/" + this.fileName + "_front.jpg";

                var img2 = document.createElement("img");
                img2.src = "/modules/default/photo/image/" + this.fileName + "_side.jpg";

                wrapper.appendChild(img1);
                wrapper.appendChild(img2);

		return wrapper;
	},

	drawComparePage: function() {
		var wrapper = document.createElement("div");
		wrapper

		// origin image
		var img1 = document.createElement("img");
                img1.src = "/modules/default/photo/image/" + this.fileName + "_front.jpg";

		var info1 = document.createElement("div");
		info1.className = "info_item";

		// current image
                var img2 = document.createElement("img");
                img2.src = "/modules/default/photo/image/" + this.fileName + "_side.jpg";

		var info2 = document.createElement("div");
		info2.className = "info_item";

                wrapper.appendChild(img1);
		wrapper.appendChild(info1);
                wrapper.appendChild(img2);
		wrapper.appendChild(info2);

                return wrapper;
	},

	drawDefaultPage: function() {
		var wrapper = document.createElement("img");
                wrapper.src = this.config.imageSrc;
		return wrapper;
	},

	getDom: function() {
		switch(this.whatPage) {
		case "resultPage":
			wrapper = this.drawResultPage();
			break;
		case "comparePage":
			wrapper = this.drawComparePage();
			break;
		default:
			wrapper = this.drawDefaultPage();
		}

		return wrapper;
	},

	getStyles: function() {
		return ["photo.css"];
	},

});
