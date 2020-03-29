/* iDeer Module */

/* Module: PhotoTest
 */

Module.register("photo",{
	defaults: {
		text: "photo module test",
		// imageSrc = "./background.jpg"
	},

	getDom: function() {
		// var wrapper = document.createElement('img');
		// wrapper.src = this.config.imageSrc;
		var wrapper = document.createElement('div');
		wrapper.innerHTML = this.config.text;
		return wrapper;
	}
});
