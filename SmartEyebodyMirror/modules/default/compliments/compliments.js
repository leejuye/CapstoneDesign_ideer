/* global Log, Module, moment */

/* Magic Mirror
 * Module: Compliments
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */
Module.register("compliments", {

	// Module config defaults.
	defaults: {
		compliments: {
			morning: [
				"안녕하세요",
				"좋은 아침입니다!",
				"원하는 기능을 \n말해주세요."
			],
			afternoon: [
				"안녕하세요",
				"좋은 점심입니다!",
				"원하는 기능을 \n말해주세요."
			],
			evening: [
				"안녕하세요",
				"좋은 저녁입니다!",
				"원하는 기능을 \n말해주세요."
			]
		},
		updateInterval: 2500,
		remoteFile: "description.json",
		fadeSpeed: 2000,
		morningStartTime: 5,
		morningEndTime: 12,
		afternoonStartTime: 12,
		afternoonEndTime: 17,
		random: false,
		noSayCnt: 0,
		badFrontCnt: 0,
		badSideCnt: 0,
		state: "initial",
		sayTF: false,
		assistState: "",
		userName: "",
		pass: false,
		command: ""
	},
	lastIndexUsed:-1,
	// Set currentweather from module
	currentWeatherType: "",

	compInterval: null,
	descCommand: null,
	waitInterval: null,

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		this.lastComplimentIndex = -1;

		var self = this;
		if (this.config.remoteFile !== null) {
			this.complimentFile(function(response) {
				self.config.compliments = JSON.parse(response);
				//self.updateDom();
			});
		}

		// Schedule update timer.
		this.compInterval = setInterval(function() {
			self.updateDom(self.config.fadeSpeed);
		}, this.config.updateInterval);

		//TEST
		/*var self = this;
		setTimeout(function() {
			self.sendNotification("PHOTO", "SHOW_COMPARE");
			Log.log("@@@@@@@");
		}, 5000);*/
	},
	// Module location
	getLocation: function() {
		var ret;
		switch (this.descCommand) {
		case "frontStart":
		case "frontResult":
		case "sideStart":
		case "sideResult":
		case "savePictureOrNot":
			ret = "bottom_right";
			break;
		case "requestGuide":
			ret = "fullscreen_above";
			break;
		default:
			ret = "middle_center";
		}
		return ret;
	},

	// Make NOT_NOW error
	makeNotNow: function(key) {
		setTimeout(() => {
			this.sendNotification("ASSISTANT_ACTIVATE", {
				type: "TEXT",
				key: key,
				text: "NOT_NOW",
				chime: false
			});
		}, 100);
	},

	// Set what commands to receive
	checkPossibleCommand: function(state, payload, command) {
		switch (state) {
		// only take_pic, lookup, shutdown
		case "initial":
			switch (payload) {
			case "dressCheck":
			case "lookup":
			case "shutdownRequest":
				this.config.pass = false;
				break;
			case "imHere":
			case "sayYes":
			case "sayNo":
				this.config.pass = true;
				this.makeNotNow(command);
				break;
			}
			break;

		// only yes or no
		case "dressCheck":
		case "frontResult":
		case "sideResult":
		case "savePictureOrNot":
		case "savePicture":
		case "shutdownRequest":
			switch (payload) {
			case "sayYes":
			case "sayNo":
				this.config.pass = false;
				break;
			case "dressCheck":
			case "imHere":
			case "lookup":
			case "shutdownRequest":
				this.config.pass = true;
				this.makeNotNow(command);
				break;
			}
			break;

		// only I'm here
		case "dressWait":
			switch (payload) {
			case "imHere":
				this.config.pass = false;
				break;
			case "dressCheck":
			case "lookup":
			case "shutdownRequest":
			case "sayYes":
			case "sayNo":
				this.config.pass = true;
				this.makeNotNow(command);
				break;
			}
			break;

		// in lookup case
		case "lookup":
			if (command.indexOf(" 전 사진 보여 줘") >= 0) {
				this.config.pass = false;
			} else if (command.indexOf("정면") >= 0) {
				this.config.pass = false;
			} else if (command.indexOf("측면") >= 0) {
				this.config.pass = false;
			} else if (command.indexOf("기준") >= 0 && command.indexOf("변경") >= 0) {
				this.config.pass = false;
			} else if (command.indexOf("이전") >= 0) {
				this.config.pass = false;
			} else if (command.indexOf("다음") >= 0) {
				this.config.pass = false;
			} else {
				this.config.pass = true;
				this.makeNotNow(command);
			}
		}
	},

	sendNotificationToAssis: function(payload, isName=false) {
		this.config.state = payload;
		setTimeout(() => {
			this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC", isName: isName});
		}, 3000);
	},

	// Override notification handler.
	notificationReceived: function(notification, payload, sender) {

		if (notification === "COMPLIMENTS") {
			Log.log(this.name + " received a module notification: " + notification + " payload: " + payload + ", from: " + sender);

			if (payload.payload === "command") {
				this.config.command = payload.command;
        			this.checkPossibleCommand(this.config.state, payload, this.config.command);
			} else {
			  this.checkPossibleCommand(this.config.state, payload);
      }

			Log.log(this.config.state +"@@@@" + payload);

			// Execute commands
			if (!this.config.pass) {
				clearInterval(this.compInterval);

				// Remove last compliment
				this.lastIndexUsed = 123;
				var self = this;
				self.updateDom();

				//savePicture
				if(payload.hasOwnProperty("number")) {
					this.filenumber = payload.number;
					payload = payload.payload;
				}
				//checkUserName, signInSuccess, notExistUserName
				if(payload.userName) {
					Log.log("@@@@!!!!!!!@@@");
					Log.log(payload);
					this.config.userName = payload.userName;
					payload = payload.payload;
				}

				this.descCommand = payload;
				this.lastIndexUsed = -1;
				this.compInterval = setInterval(function() {
					self.updateDom(self.config.fadeSpeed);
				}, this.config.updateInterval);

				this.sendNotification("CHANGE_POSITIONS",
					modules = {
						"compliments":{
							visible: "true",
							position: this.getLocation(),
						}
					}
				);

				switch(payload){
				case "CURRENTWEATHER_DATA":
					this.setCurrentWeatherType(payload.data);
					break;
				case "dressCheck":
					this.config.state = payload;
					setTimeout(() => {
						this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC"});
					}, 7000);
					break;
				case "dressWait":
					this.config.state = payload;
					this.waitInterval = setInterval(function() {
					// shutdown now
					}, 600000);  // wait 10 minutes = 600000
					break;
				case "imHere":
					this.sendNotification("PHOTO", "TAKE_PIC");
					break;
				case "frontStart":
					this.config.state = payload;
					break;
				case "frontResult":
					this.config.state = payload;
					break;
				case "sideResult":
					this.config.state = payload;
					break;
				case "savePictureOrNot":
					this.config.state = payload;
					break;
				case "savePicture":
					this.config.state = payload;
					setTimeout(() => {
						this.sendNotification("PHOTO", "SHOW_COMPARE");
					}, 10000);
					break;
				case "lookup":
					this.config.state = payload;
					this.sendNotification("ASSISTANT", "lookup");
					break;
				case "checkUserName":
					this.config.tmpName = this.config.userName;
				case "shutdownRequest":
				case "alreadyExistName":
					this.sendNotificationToAssis(payload);
					break;
				case "signUpRequest":
					this.sendNotificationToAssis(payload, true);
					break;
				case "sayYes":
					switch(this.config.state){
					case "dressCheck":
						this.sendNotification("PHOTO", "TAKE_PIC");
						break;
					case "frontResult":
						this.sendNotification("PHOTO", "TAKE_PIC_SIDE");
						break;
					case "sideResult":
						this.sendNotification("PHOTO", "SHOW_RESULT");
						break;
					case "savePictureOrNot":
						this.sendNotification("PHOTO", "COUNT_FILE");
						break;
					case "shutdownRequest":
						this.sendNotification("HIDE_ALL_MODULES");
						break;
					case "checkUserName":
						console.log("!!!!!!@@@@@@@@@!!!!!!!");
						console.log(payload);
						this.sendNotification("CHECK_NAME_IN_DB", this.config.tmpName);
						break;
					case "alreadyExistName":
						this.sendNotification("SIGN_IN_USER", this.config.tmpName);
						break;
					}
					break;
				case "sayNo":
					switch(this.config.state){
					case "dressCheck":
						this.sendNotification("PHOTO", "dressWait");
						break;
					case "frontResult":
						this.config.badFrontCnt++;
						if (this.config.badFrontCnt === 3) {
							this.sendNotification("PHOTO", "tryAgain");
							this.config.state = "initial";
							this.config.badFrontCnt = 0;
						} else {
							this.sendNotification("PHOTO", "TAKE_PIC");
						}
						break;
					case "sideResult":
						this.config.badSideCnt++;
						if (this.config.badSideCnt === 3) {
							this.sendNotification("PHOTO", "tryAgain");
							this.config.state = "initial";
							this.config.badSideCnt = 0;
						} else {
							this.sendNotification("PHOTO", "TAKE_PIC_SIDE");
						}
						break;
					case "savePictureOrNot":
						this.sendNotification("PHOTO", "REMOVE_RESULT");
						break;
					case "shutdownRequest":
						break;
					case "checkUserName":
						this.sendNotification("ASSISTANT_COMMAND", {
							command: "SIGN_UP_REQUEST"
						});
						break;
					default:
						this.config.state = payload;
						break;
					}
					if (this.config.state !== "dressWait") {
						this.config.state = "initial";
					}
					break;
				}
			}
			this.config.pass = false;
		} else if (notification === "ASSISTANT_LISTEN") {  // Assistant is listening
			Log.log(this.name + " received a 'module' notification: " + notification + " from sender: " + sender.name);
			this.config.assistState = "listen";
			this.config.sayTF = false;
			if (this.config.state === "dressWait") {
				clearInterval(this.waitInterval);
			}
		} else if (notification === "ASSISTANT_CONFIRMATION") {  // You said something
			Log.log(this.name + " received a 'module' notification: " + notification + " from sender: " + sender.name);
			this.config.sayTF = true;
		} else if (notification === "ASSISTANT_ERROR") {
			Log.log(this.name + " received a 'module' notification: " + notification + " from sender: " + sender.name);
			if (this.config.assistState === "listen") {
				if (this.config.sayTF === true) {  // You said non-keyword
					setTimeout(() => {
						this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC"});
					}, 3000);
				} else {  // You said nothing
					this.config.noSayCnt++;
					if (this.config.noSayCnt === 3) {
						// shutdown now
						this.config.noSayCnt = 0;
					} else {
						setTimeout(() => {
							this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC"});
						}, 3000);
					}
				}
				this.config.assistState = "";
				this.config.sayTF = false;
			}
		}
	},

	/* randomIndex(compliments)
	 * Generate a random index for a list of compliments.
	 *
	 * argument compliments Array<String> - Array with compliments.
	 *
	 * return Number - Random index.
	 */
	randomIndex: function(compliments) {
		if (compliments.length === 1) {
			return 0;
		}

		var generate = function() {
			return Math.floor(Math.random() * compliments.length);
		};

		var complimentIndex = generate();

		while (complimentIndex === this.lastComplimentIndex) {
			complimentIndex = generate();
		}

		this.lastComplimentIndex = complimentIndex;

		return complimentIndex;
	},

	/* complimentArray()
	 * Retrieve an array of compliments for the time of the day.
	 *
	 * return compliments Array<String> - Array with compliments for the time of the day.
	 */
	complimentArray: function() {
		var hour = moment().hour();
		var compliments;

		// description setting

		if(this.descCommand != null) {
			if(this.config.compliments.hasOwnProperty(this.descCommand)) {
				compliments = this.config.compliments[this.descCommand];
			}
		} else if (hour >= this.config.morningStartTime && hour < this.config.morningEndTime && this.config.compliments.hasOwnProperty("morning")) {
    		compliments = this.config.compliments.morning.slice(0);
		} else if (hour >= this.config.afternoonStartTime && hour < this.config.afternoonEndTime && this.config.compliments.hasOwnProperty("afternoon")) {
    		compliments = this.config.compliments.afternoon.slice(0);
		} else if(this.config.compliments.hasOwnProperty("evening")) {
    		compliments = this.config.compliments.evening.slice(0);
		}

		if (typeof compliments === "undefined") {
			compliments = new Array();
			Log.log("@@@@@@");
		}

		if (this.currentWeatherType in this.config.compliments) {
			compliments.push.apply(compliments, this.config.compliments[this.currentWeatherType]);
		}

		// compliments.push.apply(compliments, this.config.compliments.anytime);

		return compliments;
	},

	/* complimentFile(callback)
	 * Retrieve a file from the local filesystem
	 */
	complimentFile: function(callback) {
		var xobj = new XMLHttpRequest(),
			isRemote = this.config.remoteFile.indexOf("http://") === 0 || this.config.remoteFile.indexOf("https://") === 0,
			path = isRemote ? this.config.remoteFile : this.file(this.config.remoteFile);
		xobj.overrideMimeType("application/json");
		xobj.open("GET", path, true);
		xobj.onreadystatechange = function() {
			if (xobj.readyState === 4 && xobj.status === 200) {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);
	},

	/* complimentArray()
	 * Retrieve a random compliment.
	 *
	 * return compliment string - A compliment.
	 */
	randomCompliment: function() {
		// get the current time of day compliments list
		var compliments = this.complimentArray();
		// variable for index to next message to display
		let index=0;
		// are we randomizing
		if(this.config.random){
			// yes
			index = this.randomIndex(compliments);
		}
		else{
			index = ++this.lastIndexUsed;
			if (index == compliments.length - 1) {
				clearInterval(this.compInterval);
			} else if (index >= compliments.length){
				return "";
			}
		}

		return compliments[index];
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = this.config.classes ? this.config.classes : "thin large bright pre-line";
		// get the compliment text
		var complimentText = this.randomCompliment();
		if(this.descCommand === "savePicture" && complimentText) {
			complimentText = [complimentText.slice(0,13), this.filenumber, complimentText.slice(13)].join("");
			this.filenumber = null;
		}
		if(this.config.userName && complimentText) {
			complimentText = `${this.config.userName}${complimentText}`;
			this.config.userName= "";
		}
		// split it into parts on newline text
		var parts= complimentText.split("\n");
		// create a span to hold it all
		var compliment=document.createElement("span");
		// process all the parts of the compliment text
		for (part of parts){
			// create a text element for each partzzz
			compliment.appendChild(document.createTextNode(part));
			// add a break
			compliment.appendChild(document.createElement("BR"));
		}
		// remove the last break
		compliment.lastElementChild.remove();
		wrapper.appendChild(compliment);

		return wrapper;
	},

	// From data currentweather set weather type
	setCurrentWeatherType: function(data) {
		var weatherIconTable = {
			"01d": "day_sunny",
			"02d": "day_cloudy",
			"03d": "cloudy",
			"04d": "cloudy_windy",
			"09d": "showers",
			"10d": "rain",
			"11d": "thunderstorm",
			"13d": "snow",
			"50d": "fog",
			"01n": "night_clear",
			"02n": "night_cloudy",
			"03n": "night_cloudy",
			"04n": "night_cloudy",
			"09n": "night_showers",
			"10n": "night_rain",
			"11n": "night_thunderstorm",
			"13n": "night_snow",
			"50n": "night_alt_cloudy_windy"
		};
		this.currentWeatherType = weatherIconTable[data.weather[0].icon];
	},
});
