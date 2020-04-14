var recipe = {
  transcriptionHooks: {
    "HOOKING_TEST": {
      pattern: "test",
      command: "INTRODUCTION"
    },
    "HOOKING_TEST2": {
      pattern: "test ([a-z 0-9]+)$",
      command: "INTRODUCTION2"
    },
  },
  commands: {
    "INTRODUCTION": {
      moduleExec: {
        module: ["MMM-AssistantMk2"],
        exec: (module, params, key) => {
          setTimeout(()=>{
            module.sendNotification("SHOW_ALERT", {message:"test", timer:2000})
          }, 100)
        }
      },
    }
  }
}

exports.recipe = recipe // Don't remove this line.
