var recipe = {
  commands: {
    "CMD_HOTWORD_PAUSE": {
      notificationExec: {
        notification: "HOTWORD_PAUSE"
      }
    },
    "CMD_HOTWORD_RESUME": {
      notificationExec: {
        notification: "HOTWORD_RESUME"
      }
    }
  },
  plugins: {
    onBeforeActivated: "CMD_HOTWORD_PAUSE",
    onAfterInactivated: "CMD_HOTWORD_RESUME"
  },
}

exports.recipe = recipe
