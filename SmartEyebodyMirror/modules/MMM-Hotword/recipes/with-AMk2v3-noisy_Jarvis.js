/** For Noisy environement **/

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
        payload: { profile:"default", type: "MIC" }
      },
      afterRecordLimit:0,
      restart:false,
    }
  }
}

exports.recipe = recipe // Don't remove this line.
