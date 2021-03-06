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
		{
			module: "MMM-pages",
			config: {
				modules:
						[["weight"], ["compliments"],
						 [ "clock", "compliments", "photo", "MMM-AssistantMk2"]],
				fixed: [],
			}
		},
		{
		    module: "MMM-Dynamic-Modules"
		},
		{
		    module: "signIn",
		},
		{
		    module: "weight",
		},
		{
		    module: "compliments",
			position: "middle_center",
		},
		{
		 	module: "clock",
		 	position: "top_center"
		},
		{
			module: "photo",
			position: "top_left"
		},
		{
			module: "MMM-AssistantMk2",
			position: "top_left",  // fullscreen_above, top_left
			config: {
				debug: false,
				useA2D: true,
				ui: "Simple",	// Fullscreen, Classic, Classic2, Simple
				assistantConfig: {
					latitude: 51.508530,
					longitude: -0.076132,
			  	},
				responseConfig: {
					useHTML5: true,
					useScreenOutput: true,
					useAudioOutput: false,
					useChime: true,
					timer: 3000,
					myMagicWord: true,
					delay: 0.5,
					playProgram: "mpg321",
					chime: {
					  beep: "beep.mp3",
					  error: "error.mp3",
					  continue: "continue.mp3",
					  open: "Google_beep_open.mp3",
					  close: "Google_beep_close.mp3",
					},
					// false - animated icons, 'standby' - static icons only for standby state, true - all static icons
					useStaticIcons: false,
				},
				micConfig: {
					recorder: "arecord",
					device: "plughw:1",  // You should use yours
				},
				defaultProfile: "default",
				profiles: {
  					"default": {
    					profileFile: "default.json",
    					lang: "ko-KR"  // ko-KR, en-US
  					}
				},
			}
		},
		{
			module: "MMM-Snowboy",
			config: {
			  debug: false,
			  AudioGain: 2.0,
			  Frontend: true,
			  Model: "jarvis",
			  Sensitivity: 1.0,
			  micConfig: {
					recorder: "arecord",
					device: "plughw:1"  // You should use yours
			  },
			  onDetected: {
					notification: "ASSISTANT_ACTIVATE",
					parameters: {
				  type: "MIC",
				  profile: "default",
				  chime: true
				 }
			  }
			}
		},
		/*{
			module: "Hello-Lucy",
			position: "top_right",
			disabled: false,
			config: {
				keyword: 'HELLO LUCY',              // keyword to activate listening for a command/sentence
				timeout: 15,                        // timeout listening for a command/sentence
				standByMethod: 'DPMS',              // 'DPMS' = anything else than RPi or 'PI'
				microphone: "0,0",                  // run "arecord -l" card # and device # mine is "0,0"
				//sounds: ["1.mp3", "11.mp3"],        // welcome sound at startup. Add several for a random greetings
				confirmationSound: "ding.mp3",      // name and extension of sound file
				startHideAll: false,                 // All modules start as hidden EXCEPT PAGE ONE
				// *** Page One is your default startup page *** This overrides startHideAll: true,
				pageOneModules: ["Hello-Lucy","MMM-EasyPix"],                     // default modules to show on page one/startup
				pageTwoModules: ["Hello-Lucy", "MMM-BMW-DS", "MMM-EventHorizon"], // modules to show on page two
				pageThreeModules: ["Hello-Lucy", "MMM-Lunartic"],                 // modules to show on page three
				pageFourModules: ["Hello-Lucy", "MMM-PC-Stats"],                  // modules to show on page four
				pageFiveModules: ["Hello-Lucy", "MMM-Searchlight"],               // modules to show on page five
				pageSixModules: ["Hello-Lucy", "MMM-NOAA3"],                      // modules to show on page six
				pageSevenModules: ["Hello-Lucy", "MMM-Recipe"],                   // modules to show on page seven
				pageEightModules: ["Hello-Lucy", "MMM-rfacts"],                   // modules to show on page eight
				pageNineModules: ["Hello-Lucy", "MMM-History"],                   // modules to show on page nine
				pageTenModules: ["Hello-Lucy", "MMM-HardwareMonitor"]            // modules to show on page ten
			}
		},*/
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
