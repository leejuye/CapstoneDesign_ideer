//
// Module : MMM-AssistantMk2
//

const path = require("path")
const exec = require("child_process").exec
const fs = require("fs")
const url = require("url")
const Assistant = require("./components/assistant.js")
const ScreenParser = require("./components/screenParser.js")
const ActionManager = require("./components/actionManager.js")
const Sound = require("./components/sound.js")

var _log = function() {
  var context = "[AMK2]"
  return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function () {
    this.config = {}
  },

  socketNotificationReceived: function (noti, payload) {
    switch (noti) {
      case "INIT":
        this.initialize(payload)
        break
      case "ACTIVATE_ASSISTANT":
        this.activateAssistant(payload)
        break
      case "ASSISTANT_BUSY":
        if (this.config.useSnowboy) this.snowboy.stop()
        break
      case "ASSISTANT_READY":
        if (this.config.useSnowboy) this.snowboy.start()
        break
      case "SHELLEXEC":
        var command = payload.command
        command += (payload.options) ? (" " + payload.options) : ""
        exec (command, (e,so,se)=> {
          log("ShellExec command:", command)
          if (e) console.log("[AMK2] ShellExec Error:" + e)
          this.sendSocketNotification("SHELLEXEC_RESULT", {
            executed: payload,
            result: {
              error: e,
              stdOut: so,
              stdErr: se,
            }
          })
        })
        break
      case "PLAY_CHIME":
        var filepath = path.resolve(__dirname, payload)
        this.sound.play(filepath,true)
        break
      case "PLAY_SOUND":
        this.sound.play(payload)
        break
    }
  },

  tunnel: function(payload) {
    this.sendSocketNotification("TUNNEL", payload)
  },

  activateAssistant: function(payload) {
    log("QUERY:", payload)
    // payload: {
    //    type: "TEXT", "MIC", "WAVEFILE",
    //    key : "query" for "TEXT"
    //    profile: "",
    //    lang: "" (optional) // if you want to force to change language
    //    useScreenOutput: true (optional) // if you want to force to set using screenoutput
    // }
    var assistantConfig = Object.assign({}, this.config.assistantConfig)
    assistantConfig.debug = this.config.debug
    assistantConfig.session = payload.session
    assistantConfig.lang = (payload.lang) ? payload.lang : ((payload.profile.lang) ? payload.profile.lang : null)
    assistantConfig.useScreenOutput = payload.useScreenOutput
    assistantConfig.useAudioOutput = payload.useAudioOutput
    assistantConfig.useHTML5 = payload.useHTML5
    assistantConfig.isName = payload.isName
    assistantConfig.micConfig = this.config.micConfig
    this.assistant = new Assistant(assistantConfig, (obj)=>{this.tunnel(obj)})

    var parserConfig = {
      screenOutputCSS: this.config.responseConfig.screenOutputCSS,
      screenOutputURI: "tmp/lastScreenOutput.html"
    }
    var parser = new ScreenParser(parserConfig, this.config.debug)
    var result = null
    this.assistant.activate(payload, (response)=> {
      response.lastQuery = payload
      if (!(response.screen || response.audio)) {
        response.error = "NO_RESPONSE"
        if (response.transcription && response.transcription.transcription && !response.transcription.done) {
          response.error = "TRANSCRIPTION_FAILS"
        }
      }
      if (response.error == "TOO_SHORT" && response) response.error = null
      if (response.screen) {
        parser.parse(response, (result)=>{
          delete result.screen.originalContent
          log("ASSISTANT_RESULT", result)
          this.sendSocketNotification("ASSISTANT_RESULT", result)
        })
      } else {
        log ("ASSISTANT_RESULT", response)
        this.sendSocketNotification("ASSISTANT_RESULT", response)
      }
    })
  },

  initialize: function (config) {
    this.config = config
    this.config.assistantConfig["modulePath"] = __dirname
    if (this.config.debug) log = _log
    console.log("[AMK2] MMM-AssistantMk2 Version:", require('./package.json').version)
    if (!fs.existsSync(this.config.assistantConfig["modulePath"] + "/credentials.json")) {
      console.log("[AMK2][ERROR] credentials.json file not found !")
    }
    log("Response delay is set to " + this.config.responseConfig.delay + ((this.config.responseConfig.delay > 1) ? " seconds" : " second"))
    if (this.config.responseConfig.useHTML5) console.log("[AMK2] Use HTML5 for audio response")
    else {
      this.sound = new Sound(this.config.responseConfig, (send) => { this.sendSocketNotification(send) } , this.config.debug )
      this.sound.init()
    }
    if (this.config.useSnowboy) {
	  const Snowboy = require("@bugsounet/snowboy").Snowboy
      this.snowboy = new Snowboy(this.config.snowboy, this.config.micConfig, (detected) => { this.hotwordDetect(detected) } , this.config.debug )
      this.snowboy.init()
    }
    this.loadRecipes(()=> this.sendSocketNotification("INITIALIZED"))
    if (this.config.useA2D) console.log ("[AMK2] Assistant2Display Server Started")
    this.assistantWeb()
    console.log("[AMK2] AssistantMk2 is initialized.")
  },

  loadRecipes: function(callback=()=>{}) {
    if (this.config.recipes) {
      let replacer = (key, value) => {
        if (typeof value == "function") {
          return "__FUNC__" + value.toString()
        }
        return value
      }
      var recipes = this.config.recipes
      for (var i = 0; i < recipes.length; i++) {
        try {
          var p = require("./recipes/" + recipes[i]).recipe
          this.sendSocketNotification("LOAD_RECIPE", JSON.stringify(p, replacer, 2))
          if (p.actions) this.config.actions = Object.assign({}, this.config.actions, p.actions)
          console.log("[AMK2] RECIPE_LOADED:", recipes[i])
        } catch (e) {
          console.log(`[AMK2] RECIPE_ERROR (${recipes[i]}):`, e.message)
        }
      }
      if (this.config.actions && Object.keys(this.config.actions).length > 0) {
        var actionConfig = Object.assign({}, this.config.customActionConfig)
        actionConfig.actions = Object.assign({}, this.config.actions)
        actionConfig.projectId = this.config.assistantConfig.projectId
        var Manager = new ActionManager(actionConfig, this.config.debug)
        Manager.makeAction(callback)
      } else {
        log("NO_ACTION_TO_MANAGE")
        callback()
      }
    } else {
      log("NO_RECIPE_TO_LOAD")
      callback()
    }
  },

  /** Assistant Web **/
  /** http://127.0.0.1:8080/activatebytext/?query=<request> **/
  /** For Fullscreen UI keyword link **/
  assistantWeb: function() {
    this.expressApp.get("/activatebytext", (req, res)=> {
      var response = {
        success: true
      }
      if (this.config.debug) console.log("[AMK2:WEB] Hello Web!")
      var query = url.parse(req.url, true).query
      if (query.query) {
        response.query = JSON.parse(JSON.stringify(query.query))
        this.sendSocketNotification("ASSISTANT_WEB", response.query)
        if (this.config.debug) console.log(`[AMK2:WEB][SEND] ${response.query}`)
      } else {
        response.success= false,
        response.error= "query_is_empty"
        if (this.config.debug) console.log(`[AMK2:WEB][ERROR] ${response.error}`)
      }
      return res.send(response)
    })
    console.log ("[AMK2] ASSISTANT_WEB Started")
  },

  /** Snowboy Callback **/
  hotwordDetect: function(detected) {
    if (detected) this.sendSocketNotification("ASSISTANT_ACTIVATE", { type:"MIC" })
  },
})

