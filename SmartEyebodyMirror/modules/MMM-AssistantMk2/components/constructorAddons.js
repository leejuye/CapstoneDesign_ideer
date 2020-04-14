const fs = require("fs")

var _log = function() {
    var context = "[AMK2:ADDONS:CONSTRUCTOR]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class CONSTRUCTOR {
  constructor(config) {
    this.config= config
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    this.debug = debug
    this.activate= true
    try {
      if (fs.existsSync("modules/MMM-AssistantMk2/addons/addons.js")) {
        const Addons = require("../addons/addons.js")
        this.addons = new Addons(this.config)
        log("Loaded addons.js")
      } else {
        this.activate = false
        log("Disabled: addons/addons.js don't exist")
      }
    } catch(err) {
      log(err)
    }

  }

  sendToAddons (noti,payload,callback = () => {}) {
    if (this.activate) this.addons.doAddons(noti,payload,callback)
  }
}

module.exports = CONSTRUCTOR
