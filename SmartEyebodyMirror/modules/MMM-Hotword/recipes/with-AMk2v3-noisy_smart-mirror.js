/** For Noisy environement **/

var recipe = {
  models: [
    {
      hotwords    : "smart_mirror",
      file        : "smart_mirror.umdl",
      sensitivity : "0.5",
    },
  ],
  commands: {
    "smart_mirror": {
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
