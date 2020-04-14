# Configuration

## Simple configuration example
```js
{
  module: "MMM-Hotword",
  position: "top_right",
  config: {
    chimeOnFinish: null,
    mic: {
      recordProgram: "arecord",
      device: "plughw:1"
    },
    models: [
      {
        hotwords    : "computer",
        file        : "computer.umdl",
        sensitivity : "0.5",
      },
    ],
    commands: {
      "computer": {
        notificationExec: {
          notification: "ASSISTANT_ACTIVATE",
          payload: (detected, afterRecord) => {
            return {profile:"default"}
          }
        },
        restart:false,
        afterRecordLimit:0
      }
    }
  }
},
```
Usually you need to set your `mic`(How feed your voice) and `models`(What to detect) and `commands`(What to do on detection).

## Default & Detail configuration
This is pre-defined default configuration. You don't need to use this entire configuration. Just select what you need to adjust for your environment then put them into module configuration `config:{}`.


```js
detectorAudioGain: 2.0,
detectorApplyFrontend: false, // When you are using `.pmdl`, set this to `false`.
// For `.umdl`, When you use only`snowboy` and `smart_mirror`, `false` is better. But with other models, `true` is better.

mic: {
  recordProgram : "rec", //record prgram, `rec`, `arecord`, `sox`, `parec` is available
  device        : null,
  sampleRate    : 16000,  // audio sample rate
  channels      : 1,      // number of channels
  threshold     : 0.5,
  thresholdStart: null,
  thresholdEnd  : null,
  silence       : 1.0, // detect end of your hotword or afterRecord.
  verbose       : false,  // log info to the console
},

recipes: [],
models: [],
commands: {},
defaultCommand: {
  notificationExec: {
    notification: "HOTWORD_DETECTED",
    payload: (detected, afterRecord) => {
      return {hotword:detected, file:afterRecord}
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
  LISTENING : "HOTWORD_LISTENING",
  SLEEPING : "HOTWORD_SLEEPING",
  ERROR : "HOTWORD_ERROR",
  DETECTED: "HOTWORD_DETECTED"
},
```

- `detectorAudioGain` : set the gain of mic. Usually you don't need to set or adjust this value.
- `detectorApplyFrontend` : set pre-processing of hotword detection. When you are using `.pmdl`, set this to `false`.
  For `.umdl`, When you use only`snowboy` and `smart_mirror`, `false` is better. But with other models, `true` is better to recognize.
- `mic` : set the mic setting to feed your voice to this module.
```js
mic: {
  recordProgram : "rec", //record prgram, `rec`, `arecord`, `sox`, `parec` is available
  device        : null,
  sampleRate    : 16000,  // audio sample rate
  channels      : 1,      // number of channels
  threshold     : 0.5,
  thresholdStart: null,
  thresholdEnd  : null,
  silence       : 1.0, // detect end of your hotword or afterRecord.
  verbose       : false,  // log info to the console
},
```
  - `recordProgram` : record prgram, `rec`, `arecord`, `sox`, `parec` is available.
    On RaspberryPi or some linux machines, `arecord` is better.
    On OSX, `rec` is better.
    On Windows, `sox` might be, but I didn't test on Windows, so I cannot guarantee this module's working
    If you prefer to use `pulse audio`, `parec` would be available also.

  - `device` : If your current mic be default device, `null` would be. If not so, set a proper device name - `plughw:2`. It depends on your environment, so I cannot help.
  - `silence` : Your hotword or afterRecord will end after your last voice in this second.
  - `verbose` : If you set this `true`, you can get additional backend log about mic working.
- `models` : Array of `model` object. Each `model` object has this structure.
```js
{
  hotwords    : "hello_mirror",
  file        : "hello_mirror.pmdl", // Personal model of your voice "Hello mirror"
  sensitivity : "0.5",
}
```
  - `hotwords`: **String** or **Array of String**(Some .umdl could have several hotwords). If hotword is detected, this value will be returned to use.
  - `file`: your `.umdl` or `.pmdl` filename. it should be located in `models` directory.
  - `sensitivity` : set sensitivity of detection for this hotword. Try various values to find a right one for your environment.
- `commands`: Object of `command` object. See the [documents/command.md](../documents/command.md)
- `recipes`: You can define your `models` and `commands` on external recipe file instead direct describing on config.js file. Good and easy for managing config.js
- `chimeOnFinish`: If this is set, after hotword detection(or following voice recording if it exists), this chime will be played.

  **NOTICE** This feature is using HTML5 autoplay, but in some envirionment, the autoplay policy makes this feature disabled. See [documents/install.md](../documents/install.md)
- `useDisplay`: if set as `true`, the module status and detected hotword will be displayed.
- `icons`: Set of icon used on `useDisplay:true`. You can use 5000+ `iconify` icons. (https://iconify.design/icon-sets/)
- `iconify`: `iconify` script URL. When you are using this module with other which is using iconify also, you can set this to `null` to prevent duplicated scripts.
- `notifications`: You can redefine notifications.
