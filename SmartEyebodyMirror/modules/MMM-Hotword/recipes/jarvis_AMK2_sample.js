var recipe = {
  models: [
    {
      hotwords: ["jarvis", "jarvis"],
      file: "jarvis.umdl",
      sensitivity: "0.8,0.8",
    },
  ],
  commands: {
    "jarvis": { //When `jarvis` is said, MMM-AssistantMk2 will be activated.
      notificationExec: {
        notification: "ASSISTANT_ACTIVATE",
        payload: (hotword, file) => {
          return {profile: "default"}
        }
      },
      restart:false
    }
  }
}

exports.recipe = recipe // Don't remove this line.
