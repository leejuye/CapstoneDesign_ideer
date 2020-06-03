"use strict";

const Gpio = require("onoff").Gpio; // Gpio class
const LED = new Gpio(14, "out");       // Export GPIO17 as an output
var blinkInterval = setInterval(blinkLED, 50000);

function blinkLED() { //function to start blinking
	if (LED.readSync() === 0) { //check the pin state, if the state is 0 (or off)
		LED.writeSync(1); //set pin state to 1 (turn LED on)
	} else {
		LED.writeSync(0); //set pin state to 0 (turn LED off)
	}
}

function endBlink() { //function to stop blinking
	clearInterval(blinkInterval); // Stop blink intervals
	LED.writeSync(0); // Turn LED off
	LED.unexport(); // Unexport GPIO to free resources
}

setTimeout(endBlink, 1000000); //stop blinking after 5 seconds