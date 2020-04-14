/**  MMM-NewPIR V2 commands addon             **/
/**    automatic Turn on screen               **/
/**       on AMk2 usage                       **/
/**  automatic Turn off after delay time      **/
/**  Force Turn off vocal control             **/
/**  modify pattern in your prefered language **/
/**         @bugsounet                        **/


var recipe = {
  transcriptionHooks: {
    "NEWPIR_TURNOFF": {
      pattern: "turn off screen",
      command: "NEWPIR_TURNOFF"
    }
  },
  commands: {
    "NEWPIR_WAKEUP": {
      notificationExec: {
        notification: "USER_PRESENCE",
        payload : true
      }
    },
    "NEWPIR_TURNOFF": {
      notificationExec: {
        notification: "USER_PRESENCE",
        payload : false
      },
      soundExec: {
        chime: "close"
      }
    },
  },
  plugins: {
    onBeforeActivated: "NEWPIR_WAKEUP",
    onBeforeScreenResponse: "NEWPIR_WAKEUP",
    onReady: "NEWPIR_WAKEUP"
  },
}

exports.recipe = recipe
