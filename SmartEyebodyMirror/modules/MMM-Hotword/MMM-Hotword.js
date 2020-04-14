//
// Module : MMM-Hotword
//


Module.register("MMM-Hotword", {
  defaults: {
    detectorAudioGain: 2.0,
    detectorApplyFrontend: false, // When you are using `.pmdl`, set this to `false`.
    // For `.umdl`, When you use only`snowboy` and `smart_mirror`, `false` is better. But with other models, `true` is better.
    mic: {
      recordProgram: "rec", //record prgram, `rec`, `arecord`, `sox`, `parec` is available
      device: null,
      sampleRate: 16000, // audio sample rate
      channels: 1, // number of channels
      threshold: 0.5,
      thresholdStart: null,
      thresholdEnd: null,
      silence: '1.0',
      verbose: false, // log info to the console
    },
    recipes: [],
    models: [],
    commands: {},
    defaultCommand: {
      notificationExec: {
        notification: "HOTWORD_DETECTED",
        payload: (detected, afterRecord) => {
          return {
              hotword: detected,
              file: afterRecord
          }
        }
      }
    },
    chimeOnFinish: "resources/ding.wav", // If you don't want to use chime, set this to null.
    useDisplay: true,
    iconify: "https://code.iconify.design/1/1.0.2/iconify.min.js",
    //iconify: null,
    //When you use this module with `MMM-CalendarExt2`, `MMM-Spotify` or any other `iconify` used modules together, Set this to null.

    icons: { //https://iconify.design/icon-sets/
      waiting: "uil-comment-message",
      detected: "uil-comment-exclamation",
      finished: "uil-comment-dots",
    },


    // customizable notification trigger
    notifications: {
      PAUSE: "HOTWORD_PAUSE",
      RESUME: "HOTWORD_RESUME",
      LISTENING: "HOTWORD_LISTENING",
      SLEEPING: "HOTWORD_SLEEPING",
      ERROR: "HOTWORD_ERROR",
      DETECTED: "HOTWORD_DETECTED",
      PYTHON: "PYTHON_START"
    },
  },

  getStyles: function() {
    return ["MMM-Hotword.css"]
  },

  getScripts: function() {
    r = []
    if (this.config.iconify && this.config.useDisplay) {
      r.push(this.config.iconify)
    }
    return r
  },

  repeatTest: function(file) {
    if (file) {
      var s = document.getElementById("HOTWORD_REPEAT_SOURCE")
      s.src = "modules/MMM-Hotword/" + file
      var a = document.getElementById("HOTWORD_REPEAT")
      a.load()
    }
  },

  start: function() {
    this.isInitialized = 0
    this.initConfig()
    this.sendSocketNotification('INIT', this.config)
  },

  initConfig: function() {
    this.config.mic = Object.assign({}, this.defaults.mic, this.config.mic)
    this.config.icons = Object.assign({}, this.defaults.icons, this.config.icons)
    this.config.notifications = Object.assign({}, this.defaults.notifications, this.config.notifications)
  },

  getDom: function() {
    var dom = document.createElement("div")
    dom.id = "HOTWORD"
    var icon = document.createElement("div")
    icon.id = "HOTWORD_ICON"
    var i1 = document.createElement("span")
    i1.id = "HOTWORD_ICON_WAITING"
    i1.className = "iconify"
    i1.dataset.icon = this.config.icons.waiting
    var i2 = document.createElement("span")
    i2.id = "HOTWORD_ICON_DETECTED"
    i2.className = "iconify"
    i2.dataset.icon = this.config.icons.detected
    var i3 = document.createElement("span")
    i3.id = "HOTWORD_ICON_DISABLED"
    i3.className = "iconify"
    i3.dataset.icon = this.config.icons.finished
    icon.appendChild(i1)
    icon.appendChild(i2)
    icon.appendChild(i3)
    dom.appendChild(icon)
    var text = document.createElement("div")
    text.id = "HOTWORD_DETECTED"
    dom.appendChild(text)
    var repeat = document.createElement("audio")
    repeat.id = "HOTWORD_REPEAT"
    repeat.autoplay = true
    var source = document.createElement("source")
    source.id = "HOTWORD_REPEAT_SOURCE"
    repeat.appendChild(source)
    var beep = document.createElement("audio")
    beep.id = "HOTWORD_BEEP"
    var bSource = document.createElement("source")
    if (this.config.chimeOnFinish) {
      bSource.src = "modules/MMM-Hotword/" + this.config.chimeOnFinish
    }
    beep.appendChild(bSource)
    dom.appendChild(beep)
    dom.appendChild(repeat)
    return dom
  },

  notificationReceived: function(notification, payload, sender) {
    switch (notification) {
      case this.config.notifications.RESUME:
        this.sendSocketNotification('RESUME', true)
        break
      case this.config.notifications.PAUSE:
        this.sendSocketNotification('PAUSE', true)
        break
    }
  },

  socketNotificationReceived: function(notification, payload) {
    switch (notification) {
      case "START":
      case "DETECT":
      case "SOUND":
        this.status(notification, payload)
        break
      case "FINISH":
        if (!payload.detected) {
          this.sendSocketNotification('RESUME')
        } else {
          this.sendSocketNotification('PAUSE')
          this.playBeep()
          this.doCommand(payload.hotword, payload.file)
        }
        break
      case 'INITIALIZED':
        this.sendSocketNotification('RESUME')
        break
      case 'ALREADY_RESUMED':
      case 'RESUMED':
        this.sendNotification(this.config.notifications.LISTENING)
	this.sendNotification(this.config.notifications.PYTHON)
        break
      case 'PAUSED':
      case 'ALREADY_PAUSED':
        this.sendNotification(this.config.notifications.SLEEPING)
        this.status("DISABLED")
        break
      case 'ERROR':
        this.sendNotification(this.config.notifications.ERROR, payload)
        console.log('[HOTWORD] Error: ', payload)
        break
      case "LOAD_RECIPE":
        let reviver = (key, value) => {
          if (typeof value === 'string' && value.indexOf('__FUNC__') === 0) {
            value = value.slice(8)
            let functionTemplate = `(${value})`
            return eval(functionTemplate)
          }
          return value
        }
        var p = JSON.parse(payload, reviver)
        if (p.hasOwnProperty("models") && Array.isArray(p.models)) {
          this.config.models = [].concat(this.config.models, p.models)
        }
        if (p.hasOwnProperty("commands") && typeof p.commands == "object") {
          this.config.commands = Object.assign({}, this.config.commands, p.commands)
        }
        break
    }
  },

  playBeep: function() {
    if (!this.config.chimeOnFinish) return
    var beep = document.getElementById("HOTWORD_BEEP")
    beep.play()
  },

  doCommand: function(hotword, file) {
    console.log("[HOTWORD] Command is excuting")
    var command = (this.config.commands.hasOwnProperty(hotword)) ?
      this.config.commands[hotword] :
      this.config.defaultCommand
    if (command.hasOwnProperty("notificationExec")) {
      var ex = command.notificationExec
      var nen = (ex.hasOwnProperty("notification")) ? ex.notification : this.config.notifications.DETECTED
      var nenf = (typeof nen == "function") ? nen(hotword, file) : nen
      var nep = (ex.hasOwnProperty("payload")) ? ex.payload : { hotword: hotword, file: file }
      var nepf = (typeof nep == "function") ? nep(hotword, file) : nep
      console.log("[HOTWORD] notificationExec:", nenf, nepf)
      this.sendNotification(nenf, nepf)
    }
    if (command.hasOwnProperty("shellExec")) {
      var ex = command.shellExec
      var see = (ex.hasOwnProperty("exec")) ? ex.exec : null
      var seef = (typeof see == "function") ? see(hotword, file) : see
      console.log("[HOTWORD] shellExec:", see)
      if (seef) this.sendSocketNotification("SHELL_EXEC", seef)
    }
    if (command.hasOwnProperty("moduleExec")) {
      var ex = command.moduleExec
      var mem = (ex.hasOwnProperty("module")) ? ex.module : []
      var mem1 = (typeof mem == "function") ? mem(hotword, file) : mem
      var memf = (typeof mem1 == "string") ? [mem1] : mem1
      var mee = (ex.hasOwnProperty("exec")) ? ex.exec : null
      if (typeof mee == "function") {
        var modules = MM.getModules().enumerate((m) => {
          if (memf.includes(m.name) || memf.length == 0) {
            console.log("[HOTWORD] moduleExec:", m.name)
            mee(m, hotword, file)
          }
        })
      }
    }
    setTimeout(() => {
      if (command.hasOwnProperty("restart") && command.restart == false) {
        //do nothing
      } else {
        this.sendSocketNotification("RESUME")
      }
    }, 1000)
  },

  status: function(noti, payload = null) {
    if (!this.config.useDisplay) return
    var text = document.getElementById("HOTWORD_DETECTED")
    var icon = document.getElementById("HOTWORD_ICON")

    if (noti == "START") {
      text.innerHTML = ""
      text.className = ""
      icon.className = "start"
    }
    if (noti == "DETECT") {
      icon.className = "detected"
      if (this.config.commands.hasOwnProperty(payload.hotword)) {
        text.innerHTML = payload.hotword
        text.className = "detected"
      }
    }
    if (noti == "DISABLED") {
      icon.className = "finished"
        //  text.innerHTML = ""
    }
  },
})
