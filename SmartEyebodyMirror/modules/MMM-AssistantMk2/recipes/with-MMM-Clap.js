/*** with-MMM-Clap.js recipe ***/

var recipe = {
  
  commands: {
    "CMD_CLAP_RESUME": {
      notificationExec: {
        notification: "CLAP_RESUME"
      }
    }
  },
  plugins: {
    onAfterInactivated: "CMD_CLAP_RESUME"
  },
  
}
exports.recipe = recipe

/*** default config MMM-Clap for config.js file ***/

/*

  {
    module: "MMM-Clap",
    position: "top_left",
    config: {
      useDisplay:false,
      detector: {
        recordBackbone: "alsa",
        recordDevice: "plughw:0",
      },
      defaultCommandMode: "with-MMM-AMk2",
      commands: {
        "with-MMM-AMk2": {
          "1": {
            notificationExec: {
              notification: "ASSISTANT_ACTIVATE",
              payload: {type: "MIC"}
            },
            restart:false,
          },
        },
      }
    }
  },

*/
