var recipe = {
  commands: {
    "TELBOT_READY": {
      moduleExec: {
        module: ["MMM-AssistantMk2"],
        exec: (module) => {
          module.command_q = function(command, handler) {
            var query = handler.args
            module.notificationReceived("ASSISTANT_ACTIVATE", {
              type: "TEXT",
              key: query,
              secretMode: true,
              callback: (response)=>{
                console.log(response)
                handler.reply("TEXT", response.screen.text)
              },
            }, module)
          }
          module.sendNotification("TELBOT_REGISTER_COMMAND", {
            command: "q",
            callback: "command_q",
            description: module.translate("QUERY_HELP")
          })
          module.sendNotification("TELBOT_REGISTER_COMMAND", {
            command: "query",
            callback: "telegramCommand",
            description: module.translate("QUERY_HELP")
          })
          if (module.config.responseConfig.myMagicWord) {
            module.sendNotification("TELBOT_REGISTER_COMMAND", {
              command: "say",
              callback: "telegramCommand",
              description: module.translate("SAY_HELP")
            })
          }
        }
      },
    },
  },
  plugins: {
    onReady: "TELBOT_READY"
  },
}

exports.recipe = recipe // Don't remove this line.
