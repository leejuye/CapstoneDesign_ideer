var recipe = {
  models: [
    {
      hotwords    : ["JARVIS","JARVIS"],
      file        : "jarvis.umdl",
      sensitivity : "0.7,0.7",
    },
  ],
  commands: {
    "JARVIS": {
      notificationExec: {
        notification: "ASSISTANT_ACTIVATE",
        payload: (detected, afterRecord) => {
          var ret = {
            profile:"default",
            type: "MIC",
          }
          if (afterRecord) {
            ret.type = "WAVEFILE"
            ret.key = "modules/MMM-Hotword/" + afterRecord
          }
          return ret
        }
      },
      restart:false,
      afterRecordLimit: 7
    }
  }
}

exports.recipe = recipe // Don't remove this line.
