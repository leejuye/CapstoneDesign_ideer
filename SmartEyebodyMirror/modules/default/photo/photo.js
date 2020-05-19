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
	comparePageData: null,

	start: function() {
	 	this.current_user = null;
		this.term = 0;
		this.fileNumber = 0;
		//TEST
		//this.sendSocketNotification("TEST", null);
		//this.fileName = "1234";
		//this.id = 1;
		//this.term = -7;
		//this.sendSocketNotification("GET_AFTER_FILENAME", {"id": this.id, "term": this.term});
		//TEST END

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

	compare: function(isFront, term) {
		this.sendNotification("COMPLIMENTS", "noDescription");
		this.sendSocketNotification("GET_INFO", {
			"isFront": isFront,
			"id": 1,
			"term": term
		});
		//is_front, id, term
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
		} else if(notification === "HERE_INFO") {
			this.whatPage = "comparePage";
			this.comparePageData = payload;
		}
	 	this.updateDom();
	},

	notificationReceived: function(notification, payload, sender) {
		if(notification === "PHOTO") {
			Log.log(this.name + "received a notification: " + notification + ", payload : " + payload);
		 	this.initImage();

		 	//SHOW_COMPARE
			if(payload.term) {
				this.term = payload.term;
				payload = payload.payload;
			}

			//SHOW_COMPARE
			if(payload.isfront || !payload.isfront) {
				this.isfront = payload.isfront;
				payload = payload.payload;
				Log.log(this.isfront + "&&&&&" + payload);
			}

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
			case "dressCheck":
				this.sendNotification("COMPLIMENTS", "dressCheck");
				break;
			case "dressWait":
				this.sendNotification("COMPLIMENTS", "dressWait");
				break;
			case "RE_TAKE_PIC":
				this.sendSocketNotification("REMOVE_PIC", this.fileName + this.fileNameSuffix);
				if(this.fileNameSuffix === '_front.jpg'){
					this.initFileName();
					this.sendNotification("COMPLIMENTS", "frontStart");
				} else {
					this.sendNotification("COMPLIMENTS", "sideStart");
				}
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
				this.sendNotification("COMPLIMENTS", "deletePicture");
				break;
			case "SHOW_COMPARE":
				this.compare(this.isfront, 0);
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

	fillBox: function(box, data) {
		for(key in data) {
			box.appendChild(document.createTextNode(key + ": " + data[key].toFixed(2) + "cm"));
			box.appendChild(document.createElement("BR"));
		}
		box.lastElementChild.remove();
	},

	fillDif: function(data1, data2) {
		var box = document.createElement("div");
		box.className = "dif_item";

		for(key in data1) {
			var dif = data2[key] - data1[key];
			dif = dif.toFixed(2);

			var span = document.createElement('span');
			span.className = dif >= 0 ? "red_font" : "green_font";

			dif = "(" + (dif < 0 ? "" : "+") + dif + "cm)";
			dif = document.createTextNode(dif);
			span.appendChild(dif);

			box.appendChild(span);
			box.appendChild(document.createElement("BR"));
		}
		box.lastElementChild.remove();

		return new Promise(function(resolve, reject){
				resolve(box);
			});
	},

	makeDateFormat: function(date) {
		var ret = date.substr(0,4) + "." +
			date.substr(4,2) + "." +
			date.substr(6,2);
		return ret;
	},

	drawComparePage: async function() {
		var data = this.comparePageData;
		var wrapper = document.createElement("div");

		if(data.fileNum == 0){
			this.sendNotification("COMPLIMENTS", "photoNotExist");
			return wrapper;
		}

		// Draw before info
		// base image
		var imgBox1 = document.createElement("div");
		imgBox1.className = "info_img_box";

		var img1 = document.createElement("img");
		img1.src = "/modules/default/photo/image/" + data.beforeFileName + (data.isFront ? "_front" : "_side") + ".jpg";
		img1.className = "info_img"

		var info1 = document.createElement("div");
		info1.className = "info_item";
		this.fillBox(info1, data.beforeData);

		imgBox1.appendChild(img1);
		imgBox1.appendChild(document.createTextNode(this.makeDateFormat(data.beforeFileName)));

		wrapper.appendChild(imgBox1);
		wrapper.appendChild(info1);

		// Draw after info
		if(data.fileNum > 1){
			var imgBox2 = document.createElement("div");
			imgBox2.className = "info_img_box";

			var img2 = document.createElement("img");
			img2.src = "/modules/default/photo/image/" + data.afterFileName + (data.isFront ? "_front" : "_side") + ".jpg";
			img2.className = "info_img";

			var info2 = document.createElement("div");
			info2.className = "info_item";
			this.fillBox(info2, data.afterData);

			imgBox2.appendChild(img2);
			imgBox2.appendChild(document.createTextNode(this.makeDateFormat(data.afterFileName)));

			wrapper.appendChild(imgBox2);
			wrapper.appendChild(info2);

			var tmp = await this.fillDif(data.beforeData, data.afterData);
			wrapper.appendChild(tmp);
		}
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
