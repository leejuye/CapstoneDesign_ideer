/* Magic Mirror Config Sample
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 *
 * For more information how you can configurate this file
 * See https://github.com/MichMich/MagicMirror#configuration
 *
 */

var config = {
	address: "localhost", // Address to listen on, can be:
	                      // - "localhost", "127.0.0.1", "::1" to listen on loopback interface
	                      // - another specific IPv4/6 to listen on a specific interface
	                      // - "", "0.0.0.0", "::" to listen on any interface
	                      // Default, when address config is left out, is "localhost"
	port: 8080,
	ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1"], // Set [] to allow all IP addresses
	                                                       // or add a specific IPv4 of 192.168.1.5 :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
	                                                       // or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	language: "ko",
	timeFormat: 24,
	units: "metric",
	// serverOnly:  true/false/"local" ,
			     // local for armv6l processors, default
			     //   starts serveronly and then starts chrome browser
			     // false, default for all  NON-armv6l devices
			     // true, force serveronly mode, because you want to.. no UI on this device

	modules: [
		// {
		// 	module: "alert",
		// },
		// {
		// 	module: "updatenotification",
		// 	position: "top_bar"
		// },
		// {
		// 	module: "calendar",
		// 	header: "US Holidays",
		// 	position: "top_left",
		// 	config: {
		// 		calendars: [
		// 			{
		// 				symbol: "calendar-check",
		// 				url: "webcal://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics"					}
		// 		]
		// 	}
		// },
		{
		    module: "compliments",
		 	position: "lower_third"
		},
		{
		 	module: "clock",
		 	position: "top_center"
		},
		{
			module: "photo",
			position: "middle_center"
		},
		{
			module: "MMM-Hotword",
			position: "top_center",
			config: {
				chimeOnFinish: null,
				mic: {
					recordProgram: "arecord",
					device: "plughw:0"
				},
				models: [
					{
						hotwords    : "smart_mirror",
						file        : "smart_mirror.umdl",
						sensitivity : "10",
					},
				],
				commands: {
					"smart_mirror": {
						notificationExec: {
							notification: "ASSISTANT_ACTIVATE",
							payload: (detected, afterRecord) => {
								return {profile:"default"}
							}
						},
						restart:false,
						afterRecordLimit:0
					}
				}
			}
		},
		{
			module: "MMM-AssistantMk2",
			position: "top_center",
			config: {
				deviceLocation: {
					coordinates: {
						latitude: 37.5650168, // -90.0 - +90.0
						longitude: 126.8491231, // -180.0 - +180.0
					},
				},
				record: {
					recordProgram : "arecord",
					device        : "plughw:0",
				},
				notifications: {
					ASSISTANT_ACTIVATED: "HOTWORD_PAUSE",
					ASSISTANT_DEACTIVATED: "HOTWORD_RESUME",
				},
				useWelcomeMessage: "brief today",
				profiles: {
					"default" : {
						lang: "en-US"
					}
				},
			}
		},
		// {
		// 	module: "currentweather",
		// 	position: "top_right",
		// 	config: {
		// 		location: "New York",
		// 		locationID: "",  //ID from http://bulk.openweathermap.org/sample/city.list.json.gz; unzip the gz file and find your city
		// 		appid: "YOUR_OPENWEATHER_API_KEY"
		// 	}
		// },
		// {
		// 	module: "weatherforecast",
		// 	position: "top_right",
		// 	header: "Weather Forecast",
		// 	config: {
		// 		location: "New York",
		// 		locationID: "5128581",  //ID from http://bulk.openweathermap.org/sample/city.list.json.gz; unzip the gz file and find your city
		// 		appid: "YOUR_OPENWEATHER_API_KEY"
		// 	}
		// },
	// 	{
	// 		module: "newsfeed",
	// 		position: "bottom_bar",
	// 		config: {
	// 			feeds: [
	// 				{
	// 					title: "New York Times",
	// 					url: "http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml"
	// 				}
	// 			],
	// 			showSourceTitle: true,
	// 			showPublishDate: true,
	// 			broadcastNewsFeeds: true,
	// 			broadcastNewsUpdates: true
	// 		}
	// 	},
	]

};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}
