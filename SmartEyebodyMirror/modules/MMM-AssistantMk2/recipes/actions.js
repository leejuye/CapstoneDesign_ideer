var recipe = {
  actions: {
    "test": {
      "patterns": [
        "hide $SchemaOrg_Text:modulename",
        "remove $SchemaOrg_Text:modulename",
      ],
      "parameters": [
        {
          "name": "modulename",
          "type": "SchemaOrg_Text"
        }
      ],
      "response": "Yes, sir! I'll hide $modulename",
      "commandName": "COMMAND_TEST",
      "commandParams": {
        "module": "$modulename",
      },
    },
    "test3": {
      "patterns": [
        "play yellow",
        "play Yellow",
        "play blue",
        "play Blue",
        "play green",
        "play Green",
        "play color"
      ],
      "response": "ok play color!",
    }
  },

  commands: {
    "COMMAND_TEST": {
      functionExec:{
        exec: (params)=> {
          console.log(">", params)
        }
      }
    }
  }
}

Log.log("##### This is actions.js #####");
console.log("##### This is actions.js #####");

exports.recipe = recipe // Don't remove this line.
