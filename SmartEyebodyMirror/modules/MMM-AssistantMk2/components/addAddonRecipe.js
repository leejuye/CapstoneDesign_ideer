var _log = function() {
    var context = "[AMK2:ADDONS:LOAD]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class ADDONRECIPE {
  constructor(config) {
    this.config= config
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    this.debug = debug
  }

  add (recipe,name,callback = () => {}) {
    if (!name) {
      log("[ERROR] NO_NAME_FOR_ADDON")
      return false
    }
    if (recipe) {
      let replacer = (key, value) => {
        if (typeof value == "function") {
          return "__FUNC__" + value.toString()
        }
        return value
      }
      try {
        var p = require("../addons/" + recipe).addon
        log("Loaded:", recipe)
        log(name +" is enabled")
        callback("LOAD_RECIPE", JSON.stringify(p, replacer, 2))
        return true
      } catch (e) {
        log(`ADDON_ERROR (${recipe}):`, e.message)
        log(name +" is disabled")
        return false
      }
    } else {
      log("[ERROR] NO_ADDON_TO_LOAD")
      return false
    }
  }
}

module.exports = ADDONRECIPE
