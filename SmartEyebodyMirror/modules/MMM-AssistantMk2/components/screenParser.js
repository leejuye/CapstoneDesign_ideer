const HTMLParser = require("node-html-parser")
const Cheerio = require("cheerio")
const path = require("path")
const fs = require("fs")
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()

var _log = function() {
    var context = "[AMK2:SP]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class SCREENPARSER {
  constructor(config,debug) {
    this.config = config
    if (debug == true) log = _log
  }

  parse(response, endCallback=()=>{}) {
    if (response.screen) {
      var uri = this.config.screenOutputURI
      var filePath = path.resolve(__dirname, "..", uri)
      var str = response.screen.originalContent.toString("utf8")
      var disableTimeoutFromScreenOutput = (str) => {
        return str.replace(/document\.body,"display","none"/gim,(x)=>{
          return `document.body,"display","block"`
        })
      }
      str = disableTimeoutFromScreenOutput(str)

      var url = "/modules/MMM-AssistantMk2/" + this.config.screenOutputCSS + "?seed=" + Date.now()
      str = str.replace(/<style>html,body[^<]+<\/style>/gmi, `<link rel="stylesheet" href="${url}">`)

      var ret = HTMLParser.parse(response.screen.originalContent)
      var dom = ret.querySelector(".popout-content")
      if (dom) response.screen.text = dom.structuredText
      response.screen = this.parseScreenLink(response.screen)
      response.screen.photos = []
      var photos = ret.querySelectorAll(".photo_tv_image")
      if (photos) {
        for (var i=0; i < photos.length; i++) {
          response.screen.photos.push(photos[i].attributes["data-image-url"])
        }
      }

      response.screen.help = []
      var help = ret.querySelectorAll('.follow-up-query')
      if (help) {
        for (var i=0; i < help.length; i++) {
          response.screen.help.push(help[i].attributes["data-follow-up-query"])
          log("HELP:WORD", help[i].attributes["data-follow-up-query"])
        }
      }

      response.screen.trysay = null
      var trysay = ret.querySelectorAll(".assistant_response")
      if (trysay && trysay[0]) {
        response.screen.trysay = trysay[0].rawText
        log("TRYSAY:TRANSLATE", trysay[0].rawText)
      }

      var cheerio = Cheerio.load(str)
      var length = cheerio(".follow-up-query").length // length of keyword
      if (length) { // if exist
        var add= []
        for (var x = 0; x < length; x++) {
          add[x]= "location.href='http://127.0.0.1:8080/activatebytext/?query=" + response.screen.help[x] + "'";
          //console.log("add:", add[x])
          var sug = "#suggestion_" + x
          //console.log("sug", sug)
          var change= cheerio(sug) // search with suggestion number
          change = change.attr("onClick",add[x]) // add click link to ASSISTANT_WEB
          //console.log("change:", change)
        }
      }

      str = cheerio.html() // store change
      //ready for write ! let's go ...
      var contents = fs.writeFile(filePath, str, (error) => {
        if (error) {
         log("CONVERSATION:SCREENOUTPUT_CREATION_ERROR", error)
         endCallback(error)
        } else {
          log("CONVERSATION:SCREENOUTPUT_CREATED")
          response.screen.path = filePath
          response.screen.uri = uri
          endCallback(response)
        }
      })
    }
  }

  parseScreenLink(screen) {
    var html = screen.originalContent
    screen.links = []
    var links = [
      /data-url=\"([^\"]+)\"/gmi,
      / (http[s]?\:\/\/[^ \)]+)[ ]?\)/gmi,
      /\: (http[s]?\:\/\/[^ <]+)/gmi,
    ]
    var r = null
    var res = []
    for (var i = 0; i < links.length; i++) {
      var link = links[i]
      while ((r = link.exec(html)) !== null) {
        res.push(entities.decode(r[1]))
      }
    }
    // sometime no YT link was found but displayed on screen, so search with screen.text
    if (res.length == 0) {
      var resYT = new RegExp("http[s]?\:\/\/m.youtube\.com\/watch\\?v\=([0-9a-zA-Z\-\_]+)", "ig")
      var resPL = new RegExp("http[s]?\:\/\/m.youtube\.com\/playlist\\?list\=([a-zA-Z0-9\-\_]+)", "ig")
      var youtubeVideo = resYT.exec(screen.text)
      var youtubePlaylist = resPL.exec(screen.text)
      if (youtubePlaylist) {
        log("YouTube playlist found:", youtubePlayList[0])
        res.push(youtubePlayList[0])
      } else if (youtubeVideo) {
        log("YouTube video found:", youtubeVideo[0])
        res.push(youtubeVideo[0])
      }
    }
    screen.links = res
    return screen
  }
}

module.exports = SCREENPARSER
