var recipe = {
  models: [
    {
      hotwords    : "snowboy",
      file        : "snowboy.umdl",
      sensitivity : "0.5",
    },
  ],
  commands: {
    "snowboy": { // When `snowboy` is said, `SHOW_ALERT` notification will be emitted.
      notificationExec: {
        notification: "SHOW_ALERT",
        payload: (hotword, file) => {
          return {"message": `Detected:${hotword}`, timer:2000}
        }
      }
    }
  }
}

exports.recipe = recipe // Don't remove this line.
