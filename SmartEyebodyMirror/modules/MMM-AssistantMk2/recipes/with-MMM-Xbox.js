/**  MMM-xbox commands addon           **/
/**  vocal control turn on / off       **/
/**  modify pattern into your language **/
/**         @bugsounet                 **/


var recipe = {
  transcriptionHooks: {
    "XBOX_ON": {
      pattern: "turn on xbox",
      command: "XBOX_ON"
    },
    "XBOX_OFF": {
      pattern : "turn off xbox",
      command: "XBOX_OFF"
    }
  },
  commands: {
    "XBOX_ON": {
      notificationExec: {
        notification: "XBOX_ON"
      },
      soundExec: {
        chime: "open",
      }
    },
    "XBOX_OFF": {
      notificationExec: {
        notification: "XBOX_OFF"
      },
      soundExec: {
        chime: "close",
      }
    }
  }
}

exports.recipe = recipe
