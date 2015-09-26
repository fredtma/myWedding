function appConfig(){

  return {
    "defaults":{
      "views":{
        "details":{"modules":["action", "initForm", "getPicture"], "action":[]},
        "list":{"modules":["action"], "action":[]}
      }
    },
    "lists":{
      "view":{
        "details":{"title":"Group details"},
        "list":{"title":"Group list"}
      }
    },
    "users":{
      "view":{
        "details":{"title":"User details"},
        "list":{"title":"Users list"}
      }
    }
  };
}

function appSchema(){
  return {
    "config":{
      "name": "config",
      "title": "Configuration store",
      "description": "Contains the setting for the application",
      "properties":{
        "name": {"type":"string", "pk":true},
        "type": {"type": "string"},
        "dateCreated": {"type":"datetime"},
        "dateModified": {"type":"datetime"}
      },
      "require":["name"],
      "additionalProperties":true,
    },
    "lists":
    {
        "name": "lists",
        "title": "List schema",
        "description": "The schema description for the list store",
        "properties":{
          "name": {"type":"string", "pk":true},
          "description": {"type":"string"},
          "dateCreated": {"type":"datetime"},
          "dateModified": {"type":"datetime"}
        },
        "additionalProperties":false,
        "required": ["name"]
    },
    "offline":{},
    "users":
    {
        "name": "users",
        "title": "Users schema",
        "description": "The schema description for the users store",
        "properties":{
          "firstname": {"type":"string", "key":"indexFirsrame"},
          "surname": {"type":"string", "key":"indexLastame"},
          "contact": {
            "type":"array",
            "items":{
              "type":"object",
              "properties":{
                "email": {"type":"string"},
                "number": {"type":"string"},
                "type": {"$ref":"#/definitions/contactType"}
              }
            },
            "indexes":[
              {"unique": "uniqEmail","keyPath": "contact.email"},
              {"unique": "uniqContact","keyPath": "contact.number"}
            ]
          },
          "dateCreated": {"type":"datetime"},
          "dateModified": {"type":"datetime"}
        },
        "additionalProperties":true,
        "required": ["firstname","lastname","email"],
        "definitions":{
          "contactType":{"type":"string","enum":["personal","work","secondary","other"]}
        }
      }
  }
}
