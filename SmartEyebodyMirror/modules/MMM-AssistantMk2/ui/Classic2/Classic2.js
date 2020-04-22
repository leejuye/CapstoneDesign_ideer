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

    super.getDom()
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
    
    var contener2 = document.createElement("div")
    contener2.id = "AMK2_CONTENER2"   

    var logo = document.createElement("div")
    logo.id = "AMK2_LOGO"
    
    contener2.appendChild(logo)
    var transcription = document.createElement("div")
    transcription.id = "AMK2_TRANSCRIPTION"
    contener2.appendChild(transcription)
 
    
    /** Help Word box**/
    var help = document.createElement("div")
    help.id = "AMK2_HELP"
   
    var helpbox = document.createElement("div")
    helpbox.id = "AMK2_HELPBOX"
    help.appendChild(helpbox)
    
    var trysay = document.createElement("div")
    trysay.id = "AMK2_TRYSAY"
    helpbox.appendChild(trysay)
    
    var wordbox = document.createElement("div")
    wordbox.id = "AMK2_WORDBOX"
    helpbox.appendChild(wordbox)
    
    contener2.appendChild(help)
    contener.appendChild(contener2)
        
    scoutpan.appendChild(contener)
    dom.appendChild(scoutpan)

    document.body.appendChild(dom)
    super.prepare()
  }

  fullscreen (active, status) {
    
  }
}
