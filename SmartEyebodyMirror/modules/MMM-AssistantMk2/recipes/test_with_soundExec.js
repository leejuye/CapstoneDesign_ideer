/**   Test recipes for myMagicWord      **/
/**   It display alert message          **/
/**   and natural google TTS message    **/
/**   set say message in your language  **/
/**   @bugsounet                        **/

var recipe = {
  transcriptionHooks: {
    "HOOKING_TEST": {
      pattern: "test",
      command: "MYMAGICWORD"
    },
  },
  commands: {
    "MYMAGICWORD": {
      moduleExec: {
        module: ["MMM-AssistantMk2"],
        exec: (module, params, key) => {
          setTimeout(()=>{
            module.sendNotification("SHOW_ALERT", {message:"it's works !", timer:2000})
          }, 100)
        }
      },
      soundExec: {
        chime: "open",
        say: "it's really works !" // message should be set to your language !
    }
  }
}

exports.recipe = recipe // Don't remove this line.
