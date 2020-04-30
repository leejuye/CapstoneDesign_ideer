/**  MMM-Youtube commands addon       **/
/**  modify pattern to your language  **/
/**  for STOP_YOUTUBE **/
/**  @bugsounet  **/

var recipe = {
  transcriptionHooks: {
    "STOP_YOUTUBE": {
      pattern: "stop video",
      command: "STOP_YOUTUBE"
    }
  },
  responseHooks: {
    "PLAY_YOUTUBE": {
      where: "links",
      pattern: "https:\/\/m\.youtube\.com\/watch\\?v=(.+)$",
      command: "PLAY_YOUTUBE"
    },
    "PLAYLIST_YOUTUBE": {
      where: "links",
      pattern: "https:\/\/m\.youtube\.com\/playlist\\?list=(.+)$",
      command: "PLAYLIST_YOUTUBE"
    }
  },

  commands: {
    "PLAY_YOUTUBE": {
      moduleExec: {
        module: "MMM-AssistantMk2",
        exec: (module, param, from) => {
          module.sendNotification("YOUTUBE_LOAD", {type: "id", id: param[1]})
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "PLAYLIST_YOUTUBE": {
      moduleExec: {
        module: "MMM-AssistantMk2",
        exec: (module, param, from) => {
          module.sendNotification("YOUTUBE_LOAD", {type: "playlist", listType: "playlist", id: param[1]})
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "STOP_YOUTUBE": {
      moduleExec: {
        module: "MMM-AssistantMk2",
        exec: (module, param, from) => {
          module.sendNotification("YOUTUBE_CONTROL", {command: "pauseVideo"})
        }
      },
      soundExec: {
        chime: "close"
      }
    },
    "MUTE_YOUTUBE": {
      notificationExec: {
        notification: "YOUTUBE_CONTROL",
        payload: () => {
          return {
            command: "mute"
          }
        }
      }
    },
    "UNMUTE_YOUTUBE": {
      notificationExec: {
        notification: "YOUTUBE_CONTROL",
        payload: () => {
          return {
            command: "unMute"
          }
        }
      }
    },
  },
  plugins: {
    onBeforeActivated: "MUTE_YOUTUBE",
    onBeforeAudioResponse: "MUTE_YOUTUBE",
    onAfterAudioResponse: "UNMUTE_YOUTUBE",
    onAfterInactivated: "UNMUTE_YOUTUBE"
  }
}

exports.recipe = recipe // Don't remove this line.
