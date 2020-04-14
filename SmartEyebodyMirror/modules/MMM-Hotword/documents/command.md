# Command

`MMM-Hotword` could have 3 type of commands. You can use some or all of them.

## 0. Common
You can define your custom commands like this;
```js
commands: {
  "HOTWORD": {
    notificationExec: { ... },
    // And/Or
    shellExec: { ... },
    // And/Or
    moduleExec: { ... },
    // And/Or
    restart: false, // Optional
    afterRecordLimit: 0, // Optional
  },
  "ANOTHERHOTWORD": { ... },
  ...
}
```
- When your `HOTWORD` is detected, defined Executable command will be triggered.
- If `restart` is set as `false`(default is `true`), after command execution `MMM-Hotword` will be paused. If you want to restart, you need notification `HOTWORD_RESUME`.
  This `restart:false` is useful when your command might activate sound-related features(e.g: music play) and you don't want to be interfered.
- If you don't want afterRecording (continuous recording after hotword detection), set `afterRecordLimit` to `0` to disable afterRecording. Or it will record your voice after hotword in this seconds(maximum) or until silence. Default value is `0`.
- This module can detect sequential hotwords at a time. When you say **"snowboy blah blah jarvis blah blah ... "**, the detector could catch `"snowboy-jarvis"` as hotword. you can use this `snowboy-jarvis` as your command name.
  - to use this feature, `afterRecordLimit` have to have enough time to catch following hotwords.


## 1. notificationExec
Command can emit `notification` of MagicMirror. When you need to activate other module with notification, this could.
```js
commands: {
  "snowboy": {
    notificationExec: {
      notification: "SHOW_ALERT",
      payload: {message:"hotword detected!", timer:2000}
    }
  }
}
```
- `notification` : `String` or `callback function` which will return String
By example; This could emit conditional notification
```js
notification: (hotword, file) => {
  if (file) {
    return "SOME_NOTIFICATION"
  } else {
    return "OTHER_NOTIFICATION"
  }
}
```
  - `hotword` is string of detected hotword.
  - `file` could have a path of afterRecording after hotword spoken. This file could be used for AI speech recognizer or STT or just playing for fun. (MMM-AssistantMk2(ver 3.x) will use this feature at future)
- `payload` : Any `Variables`(include Object) could be. Or `callback function` which will return `payload` could be.
```js
payload: (hotword, file) => {
  if (file) {
    return {hotword:hotword, afterRecording:file}
  } else {
    return null
  }
}
```

## 2. shellExec
Command can execute some simple shell script (e.g: python or bash script). But it just executes the shell command. Process executed by this is not controllable or manageable. If you need more, make your own module for it.
```js
commands: {
  "computer": {
    shellExec: {
      exec: "sudo reboot now"
    }
  }
}
```
- `exec`: String or callback function also.
```js
exec: (hotword, file) => {
  if (file) return "aplay " + file
  return null
}
```

## 3. moduleExec
Command can also handle module(s) itself.
```js
commands: {
  "smart_mirror": {
    moduleExec: {
      module: ["clock"],
      exec: (module, hotword, file) => {
        module.hide()
      }
    }
  }
}
```
- `module` : `String` of target module name or `Array` of names of target modules or just `[]`(for all modules). And also could be `callback` function which will return string or array.
```js
module: "clock", // This means `clock` module
module: ["clock"], // same with above.
module: ["clock", "calendar"] // This means `clock` module and `calendar` module
module: [], // This means targeting all modules
module: (hotword, file) => { return "clock" },
module: (hotword, file) => { return ["clock", "calendar"]}
module: (hotword, file) => { return [] }
```
- `exec` : `callback` function to do its job. Arguments are slightly different with other callbacks.
```js
exec: (module, hotword, file) => {
  module.hide()
}
```
  - `module`: would be targeted module(s)
