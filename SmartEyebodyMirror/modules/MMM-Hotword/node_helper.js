//
// Module : MMM-Hotword
//

"use strict"

const path = require("path")
const exec = require("child_process").exec
const Record = require("./components/lpcm16.js")
const B2W = require("./components/b2w.js")
const Detector = require("./snowboy/lib/node/index.js").Detector
const Models = require("./snowboy/lib/node/index.js").Models
const fs = require("fs")

var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function () {
    console.log("[HOTWORD] MMM-Hotword starts");
    this.config = {}
    this.models = []
    this.mic = null
    this.detector = null
    this.b2w = null
    this.afterRecordingFile = "temp/afterRecording.wav"
    this.detected = null
    this.running = false
    this.forcePause = false
    this.err = false
  },

  loadRecipes: function(callback=()=>{}) {
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
        if (p.hasOwnProperty("models") && Array.isArray(p.models)) {
          this.config.models = [].concat(this.config.models, p.models)
        }
        if (p.hasOwnProperty("commands") && typeof p.commands == "object") {
          this.config.commands = Object.assign({}, this.config.commands, p.commands)
        }
        this.sendSocketNotification("LOAD_RECIPE", JSON.stringify(p, replacer, 2))
        console.log("[HOTWORD] Recipe is loaded:", recipes[i])
      } catch (e) {
        console.log("[HOTWORD] Recipe error:", e)
      }
    }
    callback()
  },

  initializeAfterLoading: function (config) {
    this.config = config
    this.loadRecipes(()=>{
      this.sendSocketNotification("INITIALIZED")
    })
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "INIT":
        this.initializeAfterLoading(payload)
        break
      case "RESUME":
        if (payload) this.forcePause = false
        if (!this.running) {
          this.activate()
          this.sendSocketNotification("RESUMED")
        } else {
          this.sendSocketNotification("ALREADY_RESUMED")
        }
        break
      case "PAUSE":
        if (payload) this.forcePause = true
        if (this.running) {
          this.deactivate()
          this.sendSocketNotification("PAUSED")
        } else {
          this.sendSocketNotification("ALREADY_PAUSED")
        }
        break
      case "SHELL_EXEC":
        exec (payload, (e,so,se)=> {
          console.log("[HOTWORD] shellExec command:", payload)
          if (so) console.log("[HOTWORD] shellExec stdOut:", so)
          if (se) console.log("[HOTWORD] shellExec stdErr:", se)
          if (e) console.log("[HOTWORD] shellExec error:", e)
        })
        break
    }
  },

  activate: function() {
    this.b2w = null
    this.detected = null
    var models = new Models();
    var modelPath = path.resolve(__dirname, "models")
    if (this.config.models.length == 0) {
      console.log("[HOTWORD] No model to load")
      return
    }
    this.config.models.forEach((model)=>{
      model.file = path.resolve(modelPath, model.file)
      models.add(model)
    })
    this.detector = new Detector({
      resource: path.resolve(__dirname, "snowboy/resources/common.res"),
      models: models,
      audioGain: this.config.detectorAudioGain,
      applyFrontend: this.config.detectorApplyFrontend
    })
    if (!this.err) console.log("[HOTWORD] begins.")
    this.sendSocketNotification("START")
    var silenceTimer = 0
    var silenceLimit = this.config.mic.silence * 1000
    var afterRecordStart = 0
    var afterRecordLimit = 0
    this.detector
      .on("silence", ()=>{
        var now = Date.now()
        //console.log("VOID", now - silenceTimer, silenceLimit) //leave this to check recording status
        this.sendSocketNotification("SILENCE")
        if (this.b2w !== null) {
          if (now - silenceTimer > silenceLimit) {
            this.stopListening()
          }
    		}
      })
      .on("sound", (buffer)=>{
        this.sendSocketNotification("SOUND", {size:buffer.length})
        if (this.b2w !== null) {
          silenceTimer = Date.now()
          //console.log("SOUND", afterRecordLimit, silenceTimer - afterRecordStart)
          if (silenceTimer - afterRecordStart > afterRecordLimit) {
            this.stopListening()
          } else {
            this.b2w.add(buffer)
            console.log("[HOTWORD] After Recording:", buffer.length)
          }
        }
      })
      .on("error", (err)=>{
        console.log("[HOTWORD] Detector Error", err)
        this.sendSocketNotification("ERROR", {error:err})
        this.stopListening()
        return
      })
      .on("hotword", (index, hotword, buffer)=>{
        //console.log(">", hotword)
        this.detected = (this.detected) ? this.detected + "-" + hotword : hotword
        console.log("[HOTWORD] Detected:", this.detected)
        this.sendSocketNotification("DETECT", {hotword:this.detected})
        if (this.config.commands.hasOwnProperty(this.detected)) {
          var c = this.config.commands[this.detected]
          afterRecordLimit = (c.hasOwnProperty("afterRecordLimit")) ? c.afterRecordLimit * 1000 : 0
        }
        if (afterRecordLimit > 0) {
          afterRecordStart = Date.now()
          silenceTimer = Date.now()
          if (this.detected && !this.b2w) {
            this.b2w = new B2W({
              channel : this.detector.numChannels(),
              sampleRate: this.detector.sampleRate()
            })
          }
        } else {
          this.stopListening()
        }
        return
      })
    this.startListening()
  },

  deactivate: function() {
    this.stopListening()
  },

  stopListening: function() {
    if (!this.mic) return
    //this.running = false
    console.log("[HOTWORD] stops.")
    this.mic.stop()
    this.mic = null
  },

  afterListening: function(err) {
	if (err) {
     console.log("[HOTWORD:ERROR] " + err)
     this.stopListening()
     this.err = true
     return
    }
    if (this.detected) {
      if (this.b2w !== null) {
        var length = this.b2w.getAudioLength()
        if (length < 8192) {
          console.log("[HOTWORD] After Recording is too short")
          this.b2w.destroy()
          this.b2w = null
          this.finish(this.detected, null)
        } else {
          console.log("[HOTWORD] After Recording finised. size:", length)
          this.b2w.writeFile(path.resolve(__dirname, this.afterRecordingFile), (file)=>{
            this.finish(this.detected, this.afterRecordingFile)
          })
        }
      } else {
        this.finish(this.detected, null)
      }
    } else {
      this.finish()
    }
  },

  startListening: function () {
    if (this.err) return
    this.running = true
    console.log("[HOTWORD] Detector starts listening.")
    this.mic = new Record(this.config.mic, this.detector, (err)=>{this.afterListening(err)})
    this.mic.start()
  },

  finish: function(hotword = null, file = null) {
    if (this.forcePause) {
      this.sendSocketNotification("PAUSED")
      this.running = false
      return
    }
    var pl = {}
    if (hotword) {
      pl = {detected:true, hotword:hotword, file:file}
    } else {
      pl = {detected:false}
    }
    this.detected = null
    console.log("[HOTWORD] Final Result:", pl)
    if (this.running) {
      this.sendSocketNotification("FINISH", pl)
    } else {
      this.sendSocketNotification("PAUSED")
    }
    this.running = false
  },
})
