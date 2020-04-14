var recipe = {
  models: [
    {
      hotwords    : "computer",
      file        : "computer.umdl",
      sensitivity : "0.6",
    },
  ],
  commands: {
    "computer": { //When "computer" is said, `pm2 stop all` shell command will be executed.
      shellExec: {
        exec: (hotword, file) => {
          return "ls -al"
        }
      }
    }
  }
}

exports.recipe = recipe // Don't remove this line.
