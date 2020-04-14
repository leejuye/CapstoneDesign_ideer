var recipe = {
  models: [
    {
      hotwords    : "computer",
      file        : "computer.umdl",
      sensitivity : "0.6",
    },
  ],
  commands: {
    "computer": {
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
