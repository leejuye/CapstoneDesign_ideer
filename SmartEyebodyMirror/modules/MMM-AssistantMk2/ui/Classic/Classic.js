class AssistantResponse extends AssistantResponseClass{
  constructor (responseConfig, callbacks) {
    super(responseConfig, callbacks)
    this.callbacks = callbacks
  }
 
  getDom () {
    var dom = super.getDom()

    var logo = document.createElement("div")
    logo.id = "AMK2_STATUS"
    logo.onclick = (e) => {
      this.callbacks.assistantActivate({
          type: "MIC",
          profile: "default"
        }, Date.now())
    }
    dom.appendChild(logo)

    return dom
  } 
 
  prepare () {
    var dom = document.createElement("div")
    dom.id = "AMK2_HELPER"
    dom.classList.add("hidden")

    var scoutpan = document.createElement("div")
    scoutpan.id = "AMK2_RESULT_WINDOW"
    var scout = document.createElement("iframe")
    scout.id = "AMK2_SCREENOUTPUT"
    scoutpan.appendChild(scout)

    var contener = document.createElement("div")
    contener.id = "AMK2_CONTENER"

    var logo = document.createElement("div")
    logo.id = "AMK2_LOGO"
    contener.appendChild(logo)
    var transcription = document.createElement("div")
    transcription.id = "AMK2_TRANSCRIPTION"
    contener.appendChild(transcription)

    scoutpan.appendChild(contener)
    dom.appendChild(scoutpan)

    document.body.appendChild(dom)
    super.prepare()
  }

  fullscreen (active, status) {
    
  }
}
