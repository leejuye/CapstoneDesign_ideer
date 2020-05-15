/* global Module */

/* Magic Mirror
 * Module: HelloWorld
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("helloworld",{

	// Default module config.
	defaults: {
		text: "거울에게 다른 동작을 시키고 싶으면 'Hi, Deer~'를 불러주세요 :)"
	},

	getTemplate: function () {
		return "helloworld.njk";
	},

	getTemplateData: function () {
		return this.config;
	}
});
