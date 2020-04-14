var recipe = {
  models: [
    {
      hotwords    : "smart_mirror",
      file        : "smart_mirror.umdl",
      sensitivity : "0.5",
    },
  ],
  commands: {
    "smart_mirror": { //When `smart mirror` is said, clock module will be hidden.
      moduleExec: {
        module: ["clock"],
        exec: (module, hotword, file) => {
          module.hide()
        }
      }
    }
  }
}

exports.recipe = recipe // Don't remove this line.
