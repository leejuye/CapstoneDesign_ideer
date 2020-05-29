/* iDeer Module */

/* Module: PhotoTest
 */

Module.register("photo",{
	defaults: {
		text: "photo module test",
		imageSrc: ""
	},
	isLookUp: false,
	fileName: null,
	fileNameSuffix: null,
	whatPage: null,
	comparePageData: null,
	term: 0,
	isFront: true,
	fileNumber: 0,
	ver: 1,
	id: null,
	firstBase: false,
	rightFileName: null,
	weight: null,
	
	start: function() {
	 	this.current_user = null;
		//TEST
		// this.fileName = "20200521121212";
		// this.id = 1234;
		//this.term = -7;
		//this.sendSocketNotification("GET_AFTER_FILENAME", {"id": this.id, "term": this.term});
		//TEST END
		// this.sendSocketNotification("SET_INFO", {
		// 	"fileName": this.fileName,
		// 	"id": this.id
		// });
		this.initFileName();
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
		this.rightFileName = this.fileName;
		this.ver = 1;
	},

	initImage: function() {
		this.config.imageSrc = "";
		this.whatPage = null;
		this.updateDom();
	},

	compare: function(isFront, term, rightFileName, command) {
		this.sendNotification("COMPLIMENTS", "noDescription");
		this.sendSocketNotification("GET_INFO", {
			"isFront": isFront,
			"id": this.id,
			"term": term,
			"rightFileName": this.rightFileName,
			"command": command
		});
	},

	socketNotificationReceived: function(notification, payload){
		if(notification === "PREVIEW_DONE") {
			this.config.imageSrc = "/modules/default/photo/image/" + this.id + "/" + payload + "?version=" + this.ver++;
			if(payload.indexOf("front") != -1) {
				this.sendNotification("COMPLIMENTS","frontResult");
			} else {
				this.sendNotification("COMPLIMENTS","sideResult");
			}
			setTimeout(() => {
				this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC"});
			}, 3000)
		} else if(notification === "HERE_INFO") {
			this.whatPage = "comparePage";
			this.fileName = payload.afterFileName;
			this.rightFileName = payload.afterFileName;
			this.comparePageData = payload;
		} else if(notification === "HERE_FILE_NUMBER") {
			this.sendNotification("COMPLIMENTS", {"payload": "savePicture", "number": payload});
			if(payload == 1) {
				this.sendSocketNotification("CHANGE_BASE", {
					"id": this.id,
					"fileName": this.fileName
				});
				this.firstBase = true;
			}
		} else if (notification === "CONTOUR_DONE") {
			this.isLookUp = true;
			this.compare(this.isFront, this.term, this.rightFileName, null);
		} else if(notification === "CHANGE_COMPLETE") {
			if(this.firstBase === false) {
				this.sendNotification("COMPLIMENTS","changeBase");
			}
			this.initImage();
			this.term = 0;
			this.firstBase === false;
		} else if(notification === "CHANGE_NULL") {
			this.whatPage = "comparePage";
			this.sendNotification("COMPLIMENTS", payload);
		}
		if(notification !== "CONTOUR_DONE") {
			this.updateDom();
		}
	},

	notificationReceived: function(notification, payload, sender) {
		if(notification === "START_MIRROR") {
			this.weight = payload.weight;
		}
		else if(notification === "SIGN_IN_INFO"){
			this.id = payload.id;
		}
		else if(notification === "PHOTO_LOOKUP") {
			// SAY LOOKUP
			if(payload.isLookUp) {
				this.isLookUp = true;
				payload = payload.payload;
			}
			//SHOW_COMPARE
			if(payload.hasOwnProperty("isFront")) {
				this.isFront = payload.isFront;
				if(payload.term) {
					this.term = payload.term;
				}
				payload = payload.payload;
				console.log(this.isFront + "&&&&&" + payload + "&&&&" + this.term);
			}
			if (isLookUp) {
				switch(payload) {
					case "SHOW_COMPARE":
						this.compare(this.isFront, this.term, this.rightFileName, null);
						break;
					case "SHOW_NEXT":
						this.compare(this.isFront, this.term, this.rightFileName, "next");
						break;
					case "SHOW_PREV":
						this.compare(this.isFront, this.term, this.rightFileName, "prev");
						break;
					case "CHANGE_BASE":
						this.sendSocketNotification("CHANGE_BASE", {"id": this.id, "fileName": this.fileName});
						this.updateDom();																		
						break;
				}
			} else {
				// TODO: NOT NOW
			}
		}
		else if(notification === "PHOTO") {
			Log.log(this.name + "received a notification: " + notification + ", payload : " + payload);
		 	this.initImage();

			switch(payload) {
			case "TAKE_PIC":
				this.initFileName();
				this.fileNameSuffix = '_front.jpg';
				this.sendNotification("COMPLIMENTS", "frontStart");
				this.sendSocketNotification("PREVIEW", {
					"fileName": this.fileName + this.fileNameSuffix,
					"id": this.id
				});
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
				this.sendSocketNotification("PREVIEW", {
					"fileName": this.fileName + this.fileNameSuffix,
					"id": this.id
				});
				break;
			case "dressCheck":
				this.sendNotification("COMPLIMENTS", "dressCheck");
				break;
			case "dressWait":
				this.sendNotification("COMPLIMENTS", "dressWait");
				break;
			case "RE_TAKE_PIC":
				this.sendSocketNotification("REMOVE_PIC",{
					"id": this.id,
					"fileName": this.fileName + this.fileNameSuffix
				});
				if(this.fileNameSuffix === '_front.jpg'){
					this.initFileName();
					this.sendNotification("COMPLIMENTS", "frontStart");
				} else {
					this.sendNotification("COMPLIMENTS", "sideStart");
				}
				this.sendSocketNotification("PREVIEW", {
					"fileName": this.fileName + this.fileNameSuffix,
					"id": this.id
				});
				break;
			case "SHOW_RESULT":
				this.whatPage = "resultPage";
				this.sendNotification("COMPLIMENTS", "savePictureOrNot");
				setTimeout(() => {
					this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC"});
				}, 3000);
				this.updateDom();
				break;
			case "REMOVE_RESULT":
				this.sendSocketNotification("REMOVE_PIC",{
					"fileName": this.fileName + "_front.jpg",
					"id": this.id
				});
				this.sendSocketNotification("REMOVE_PIC",{
					"fileName": this.fileName + "_side.jpg",
					"id": this.id
				});
				this.sendNotification("COMPLIMENTS", "deletePicture");
				break;
			case "COUNT_FILE":
				this.sendSocketNotification("SET_INFO", {
					"fileName": this.fileName,
					"id": this.id,
					"weight": this.weight
				});
				this.sendSocketNotification("GET_FILE_NUMBER", this.id);
				break;
			}
		}
		else {
			this.isLookUp = false
		}
	},

	drawResultPage: function() {
		var wrapper = document.createElement("div");
		var img1 = document.createElement("img");
		img1.src = "/modules/default/photo/image/" + this.id + "/" + this.fileName + "_front.jpg"

		var img2 = document.createElement("img");
		img2.src = "/modules/default/photo/image/" + this.id + "/" + this.fileName + "_side.jpg";

		wrapper.appendChild(img1);
		wrapper.appendChild(img2);

		return new Promise(function(resolve, reject){
			resolve(wrapper);
		});
	},

	fillBox: function(box, data) {
		var ko = {
			"shoulder": '어깨',
			"chest": '가슴',
			"waist": '허리',
			"hip": '골반',
			"thigh": '허벅지',
			"calf": '종아리',
			"weight": '몸무게',
			"bmi":'BMI'
		}

		for(key in data) {
			if(key === "weight") {
				box.appendChild(document.createTextNode(ko[key] + ": " + data[key].toFixed(2) + "kg"));
			} else if(key === "bmi") {
				box.appendChild(document.createTextNode(ko[key] + ": " + data[key].toFixed(2)));
			} else {
				box.appendChild(document.createTextNode(ko[key] + ": " + data[key].toFixed(2) + "cm"));
			}
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
			span.className = dif > 0 ? "red_font" : "green_font";
			
			if(key === "weight") {
				dif = "(" + (dif < 0 ? "" : "+") + dif + "kg)";
			} else if(key === "bmi") {
				dif = "(" + (dif < 0 ? "" : "+") + dif + ")";
			} else {
				dif = "(" + (dif < 0 ? "" : "+") + dif + "cm)";
			}
			
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
		var ret = date.toString().substr(0,4) + "." +
			date.toString().substr(4,2) + "." +
			date.toString().substr(6,2);
		return ret;
	},

	drawComparePage: async function() {
		var data = this.comparePageData;
		var wrapper = document.createElement("div");

		if(data.fileNum === 0){
			this.sendNotification("COMPLIMENTS", "photoNotExist");
			return wrapper;
		}

		// Draw before info
		// base image
		var imgBox1 = document.createElement("div");
		imgBox1.className = "info_img_box";

		var img1 = document.createElement("img");
		img1.src = "/modules/default/photo/image/" + this.id + "/" + data.beforeFileName + (data.isFront ? "_front" : "_side") + ".jpg";
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
			img2.src = "/modules/default/photo/image/" + this.id + "/" + data.afterFileName + (data.isFront ? "_front" : "_side") + ".jpg";
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

	getDom: async function() {
		switch(this.whatPage) {
		case "resultPage":
			wrapper = await this.drawResultPage();
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
