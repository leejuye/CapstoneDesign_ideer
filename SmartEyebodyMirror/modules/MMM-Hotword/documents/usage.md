# How to use

## Concept
1. Register your voice model (`.umdl` or `.pmdl`) to detect.
```js
models: [
  {
    hotwords    : "hello_mirror",
    file        : "hello_mirror.pmdl", // Personal model of your voice "Hello mirror"
    sensitivity : "0.5",
  },
  // You can add more models here.
],
```
2. When you say hotwords `Hello mirror`, The SNOWBOY Detector will detect it and return `"hello_mirror"` as a detected result.

3. Detected hotword will fire the command. By default, when custom command is not assigned to specific hotword, `defaultCommand` will be executed. Default value is this.
```js
defaultCommand: {
  notificationExec: {
    notification: "HOTWORD_DETECTED",
    payload: (detected, afterRecord) => {
      return {
        hotword:detected,
        file:afterRecord
      }
    }
  }
},
```
This means, when hotword is detected, `HOTWORD_DETECTED` notification will be emitted. You can redefine this defaultCommand.

4. Or, you can assign specific command.
```js
commands: {
  "hello_mirror": {
    moduleExec: {
      module: ["clock"],
      exec: (module, detected, afterRecord) => {
        module.hide()
      }
    }
  }
}
```
This custom command will hide `clock` module when `hello_mirror` hotword is spoken.

Read [documents/command.md] for more detail information about command.

## Recipe
You can put your `models` and `commands` into `config:{}` all together. But long `config.js` is always somewhat head-ache to maintain.
So you make modular recipe for your models and commands. Modular recipe can be easily added or removed from configuration.

### How to use recipe
```js
config: {
  ...
  recipes: ["some_recipe.js", "another_recipe.js"],
}
```
You can describe recipe files you want to include in configuration.

Recipe file structure looks like this;
```js
var recipe = {
  models: [
    { ... },
    { ... },
    ...
  ],
  commands: {
    "SOME_HOTWORD": { ... },
    "OTHER_HOTWORD": { ... },
    ...
  },
}
exports.recipe = recipe // Don't remove this line.
```
This is a real example of recipe file

```js
var recipe = {
  models: [
    {
      hotwords    : "hideall",
      file        : "hideall.pmdl",
      sensitivity : "0.5",
    },
    {
      hotwords    : "showall",
      file        : "showall.pmdl",
      sensitivity : "0.5",
    },
  ],
  commands: {
    "hideall": {
      moduleExec: {
        module: [],
        exec: (module) => { module.hide()}
      }
    },
    "showall": {
      moduleExec: {
        module: [],
        exec: (module) => { module.show()}
      }
    },
  },
}
exports.recipe = recipe // Don't remove this line.
```
Save this as `hide_show_all.js` into `recipes` directory, then make your personal voice models "hideall.pmdl" and "showall.pmdl" with `trainer` and copy them into `models` directory
Then modify your configuration like this.

```js
config: {
  ...
  recipes: ["hide_show_all"]
  ...
}
```
Now you can use your custom command `Show all` and `Hide all`. And you can maintain your `config.js` cleanly.

## Notification
Other modules can get these notifications from MMM-Hotword by default (You can redefine notification in configuration)

|notification | payload | description |
|---|---|---|
|HOWORD_LISTENING| `null` | MMM-Hotword is ready to listen your voice.
|HOTWORD_SLEEPING | `null` | MMM-Hotword is not ready.
|HOTWORD_ERROR | `error object` | There is some error.
|HOTWORD_DETECTED | {hotword:`string`, file:`string`} | Unless redefine `defaultCommand`, this notification will be emitted with payload by default.


Other modules can also make order to MMM-Hotword by these notifications.(re-definable too)

|notification | payload | description |
|---|---|---|
|HOTWORD_RESUME | null | Activate
|HOTWORD_PAUSE | null | Deactivate

Activation & Deactivation may be needed when you are using this module with other Mic/Speaker related modules (e.g: MMM-AssistantMk2, MMM-Spotify, or any other audio/video related modules) to avoid collision or occupation issues.

## With MMM-AssistantMk2 (ver 3.x)
```js
{
  module: "MMM-Hotword",
  position: "top_left",
  config: {
    recipes: ["with-AMk2v3_smart-mirror.js"],
    ... // your other configuration
  }
},
{
  module: "MMM-AssistantMk2",
  position: "top_left",
  config: {
    recipes: ["with-MMM-Hotword.js"],
    ... // your other configuration
  }  
},
```

## With MMM-AssistantMk2 (ver 2.x)
```js
{
    module: "MMM-AssistantMk2",
    position: "top_right",
    config: {
      record: {
        recordProgram : "arecord",  
        device        : "plughw:1",
      },

      notifications: {
        ASSISTANT_ACTIVATED: "HOTWORD_PAUSE",
        ASSISTANT_DEACTIVATED: "HOTWORD_RESUME",
      },
    }
  },
  {
  module: "MMM-Hotword",
  config: {
    mic: {
      recordProgram : "arecord",  
      device        : "plughw:1",
    },
    models: [
      {
        hotwords    : "smart_mirror",
        file        : "smart_mirror.umdl",
        sensitivity : "0.5",
      },
    ],
    defaultCommand: {
      notificationExec: {
        notification: "ASSISTANT_ACTIVATE",
        payload: (detected, afterRecord) => {
          return {profile:"default"}
        }
      },
      afterRecordLimit:0,
      restart:false,
    },
  },
},
```
