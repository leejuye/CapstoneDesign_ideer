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
		updateInterval: 500,
		remoteFile: "description.json",
		fadeSpeed: 2000,
		morningStartTime: 5,
		morningEndTime: 12,
		afternoonStartTime: 12,
		afternoonEndTime: 17,
		random: false,
		noSayCnt: 0,
		badFrontCnt: 0
	},
	lastIndexUsed:-1,
	// Set currentweather from module
	currentWeatherType: "",

	compInterval: null,
	descCommand: null,

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
	},
	// Module location
	getLocation: function() {
		var ret;
		switch (this.descCommand) {
		case "noKeyword":
			ret = "top_right";
			break;
		case "frontStart":
		case "frontResult":
			ret = "bottom_right";
			break;
		default:
			ret = "middle_center";
		}
		return ret;
	},

	// Override notification handler.
	notificationReceived: function(notification, payload, sender) {

		if (notification === "COMPLIMENTS") {
			Log.log(this.name + " received a module notification: " + notification + " payload: " + payload);

			clearInterval(this.compInterval);

			// Remove last compliment
			this.lastIndexUsed = 123;
			var self = this;
			self.updateDom();

			this.descCommand = payload;
			console.log(payload);
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
			case "frontResult" :
				this.config.text = "frontResult";
				break;
			case "tryAgain":
				this.sendNotification("COMPLIMENTS", "sayFunction");
				break;
			case "shutdownRequest":
				this.config.text = payload;
				setTimeout(() => {
					this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC"});
				}, 500);
				break;
			case "shutdownNow":
				this.config.text = payload;
				break;
			case "sayYes":
				switch(this.config.text){
				case "shutdownRequest":
					this.sendNotification("HIDE_ALL_MODULES");
					break;
				case "frontResult":
					//sideStart
					break;
				}
				this.config.text = "";
			case "sayNo":
				Log.log(this.name + " received a 'module' notification: " + notification + " from sender: " + sender.name);
				switch(this.config.text){
				case "shutdownRequest":
					break;
				case "frontResult":
					this.config.badFrontCnt++;
					if (this.config.badFrontCnt === 3) {
						this.sendNotification("FRONT_RESULT", "tryAgain");
						// this.descCommand = "tryAgain";
						// this.updateDom(5000);
						this.config.badFrontCnt = 0;
					} else {
						this.sendNotification("TAKE_PIC", "test.jpg");
					}
					break;
				}
				this.config.text = "";
			}
		}
		if(notification==="ASSISTANT_ERROR") {
			Log.log(this.name + " received a 'module' notification: " + notification + " from sender: " + sender.name);
			switch(this.config.text){
			case "shutdown":
				break;
			case "frontResult":
				this.config.noSayCnt++;
				if (this.config.noSayCnt === 2) {
					this.sendNotification("ASSISTANT_COMMAND", {
						command: "SHUTDOWN_FORCE"
					});
					this.config.noSayCnt = 0;
					break;
				}
				setTimeout(() => {
					this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC"});
				}, 3000);
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
		if(this.descCommand == "noKeyword") {
			compliments = this.config.compliments.noKeyword.slice(0);
		} else if(this.descCommand == "shutdownRequest") {
			compliments = this.config.compliments.shutdownRequest.slice(0);
		} else if(this.descCommand == "shutdownNow") {
			compliments = this.config.compliments.shutdownNow.slice(0);
		} else if (this.descCommand == "frontStart") {
			compliments = this.config.compliments.frontStart.slice(0);
		} else if (this.descCommand == "frontResult") {
			compliments = this.config.compliments.frontResult.slice(0);
		} else if (this.descCommand == "checkBody") {
			compliments = this.config.compliments.checkBody.slice(0);
		} else if (this.descCommand == "tryAgain") {
			compliments = this.config.compliments.tryAgain.slice(0);
		} else if (this.descCommand == "sayFunction") {
			compliments = this.config.compliments.sayFunction.slice(0);
		} else if (hour >= this.config.morningStartTime && hour < this.config.morningEndTime && this.config.compliments.hasOwnProperty("morning")) {
			compliments = this.config.compliments.morning.slice(0);
		} else if (hour >= this.config.afternoonStartTime && hour < this.config.afternoonEndTime && this.config.compliments.hasOwnProperty("afternoon")) {
			compliments = this.config.compliments.afternoon.slice(0);
		} else if(this.config.compliments.hasOwnProperty("evening")) {
			compliments = this.config.compliments.evening.slice(0);
		}

		if (typeof compliments === "undefined") {
			compliments = new Array();
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
		// split it into parts on newline text
		var parts= complimentText.split("\n");
		// create a span to hold it all
		var compliment=document.createElement("span");
		// process all the parts of the compliment text
		for (part of parts){
			// create a text element for each part
			compliment.appendChild(document.createTextNode(part));
			// add a break `
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
