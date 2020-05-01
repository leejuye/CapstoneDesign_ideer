/* Full Screen Mode **
**     Bugsounet    **
**********************/


class AssistantResponse extends AssistantResponseClass{
  getDom () {
    var dom = super.getDom()

    var contener = document.createElement("div")
    contener.id = "AMK2_CONTENER"

    var status = document.createElement("div")
    status.id = "AMK2_STATUS"
    status.onclick = (e) => {
      this.callbacks.assistantActivate({
          type: "MIC",
          profile: "default"
        }, Date.now())
    }
    contener.appendChild(status)

    var transcription = document.createElement("div")
    transcription.id = "AMK2_TRANSCRIPTION"
    contener.appendChild(transcription)
 
    dom.appendChild(contener)

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
   // do nothing
  }
}
