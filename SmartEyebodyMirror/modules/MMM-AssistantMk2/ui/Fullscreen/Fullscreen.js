/* Full Screen Mode **
**     Bugsounet    **
**********************/


class AssistantResponse extends AssistantResponseClass{
  getDom () {
    var dom = super.getDom()
    dom.className= "hidden out"

    var contener = document.createElement("div")
    contener.id = "AMK2_CONTENER"

    var status = document.createElement("div")
    status.id = "AMK2_STATUS"
    contener.appendChild(status)

    var transcription = document.createElement("div")
    transcription.id = "AMK2_TRANSCRIPTION"
    contener.appendChild(transcription)
    
    var logo = document.createElement("div")
    logo.id = "AMK2_LOGO"
    contener.appendChild(logo)
    
    dom.appendChild(contener)

    this.modulePosition()

    super.getDom()
    return dom
  } 

  prepare () {
    var dom = document.createElement("div")
    dom.id = "AMK2_HELPER"
    dom.classList.add("hidden")
    if(this.fullscreenAbove) dom.classList.add("fullscreen_above")

    var scoutpan = document.createElement("div")
    scoutpan.id = "AMK2_RESULT_WINDOW"
    var scout = document.createElement("iframe")
    scout.id = "AMK2_SCREENOUTPUT"
    scoutpan.appendChild(scout)
    dom.appendChild(scoutpan)

    document.body.appendChild(dom)
    super.prepare()
  }

  fullscreen (active, status) {
    var AMK2 = document.getElementById("AMK2")
    clearTimeout(this.displayTimer)
    this.displayTimer = null
    if (active && !(this.secretMode || this.sayMode)) {
      MM.getModules().exceptWithClass("MMM-AssistantMk2").enumerate((module)=> {
        module.hide(15, {lockString: "AMK2_LOCKED"})
        AMK2.className= "in" + (this.fullscreenAbove ? " fullscreen_above": "")
      })
    } else  if(!(this.secretMode)) {
      if (status && status.actual == "standby") { // only on standby mode
        AMK2.className= "out" + (this.fullscreenAbove ? " fullscreen_above": "")
        this.displayTimer = setTimeout (() => {
            MM.getModules().exceptWithClass("MMM-AssistantMk2").enumerate((module)=> {
              module.show(1000, {lockString: "AMK2_LOCKED"})
              AMK2.className= "hidden out"
            })
        }, 1000) // timeout set to 1s for fadeout
      }
    }
    super.fullscreen(active, status)
  }
}
