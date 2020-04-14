var recipe = {
  commands: {
    // Describe your command here.
    "HIDE_SELF_START": {
      moduleExec: {
        module: ["MMM-AssistantMk2"],
        exec: (module) => {
          var dom = document.getElementById("AMK2")
          dom.classList.add("hidden")
          // But with very short time, module itself will be shown then be hidden. That is not hookable.
          // Will it be a problem? Well, it might seems ugly, but anyway, it's a just once when mirror bootup.
          // Who cares? (Maybe me...)
          // Or you can modify CSS to start from hidden. And you can adjust this but... it's somewhat complex.
        }
      }
    },

    "HIDE_SELF": {
      moduleExec: {
        module: ["MMM-AssistantMk2"],
        exec: (module) => {
          module._hideTimer = null
          module._hideTimer = setTimeout(()=>{
            var dom = document.getElementById("AMK2")
            if (!dom.classList.contains("hidden")) {
              dom.classList.add("hidden")
            }
          }, 1000*3)
        }
      }
    },
    "SHOW_SELF": {
      moduleExec: {
        module: ["MMM-AssistantMk2"],
        exec: (module) => {
          if (module._hideTimer) {
            clearTimeout(module._hideTimer)
          }
          var dom = document.getElementById("AMK2")
          if (dom.classList.contains("hidden")) {
            dom.classList.remove("hidden")
            dom.classList.add("in")
            var t = setTimeout(()=>{
              dom.classList.remove("in")
            }, 1000)
          }
        }
      }
    },
  },
  plugins: {
    onAfterInactivated: "HIDE_SELF",
    onBeforeActivated: "SHOW_SELF",
    onReady: "HIDE_SELF_START",
    // Describe your plugin here.
  },
}

exports.recipe = recipe // Don't remove this line.
