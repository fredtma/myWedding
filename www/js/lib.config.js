'use strict'
//============================================================================//
// CONFIGURATION
//============================================================================//
function configuration(){}
configuration.prototype.config=function(){
    var site,api;
    var dt      = new Date().getTime();
    var caecus  = {};//hiden configfile
    var site    = {
      formatDate: 'fullDate',
      url:        window.location.origin || 'http://localhost:1336/aura',
      port:       window.location.port,
      api:        window.location.origin+"/www/",
      aura:       'ales',
      json:       this.url + 'json/caecus-birdChecklist.json',
      mail:       'support@demo.co.za',
      name:       "config",
      run:        dt,
      start:      dt,
      formatTime: 'mediumTime',
      dbName:     'dbName',
      dbVersion:  1,
      dbDesc:     'The local application Database',
      dbSize:     15,
      dbLimit:    20
    };
    dynamis.set('site',site);

    api = {
        "indexedDB":      "indexedDB" in window||"webkitIndexedDB" in window||"mozIndexedDB" in window||"msIndexedDB" in window,
        "openDatabase":   typeof openDatabase!=="undefined"||"openDatabase" in window,
        "Worker":         typeof window.Worker!=="undefined",
        "deleteWorker":   false,
        "WebSocket":      typeof window.WebSocket!=="undefined",
        "history":        typeof window.history!=="undefined",
        "formValidation": hasFormValidation(),
        "jsValidation":   true,
        "isOnline":       navigator.onLine,
        "projectID":      "17238315752",
        "chromeApp":      (typeof chrome !== "undefined" && typeof chrome.app.window!=="undefined")
    };
    api.Worker = (1)? api.Worker: false;//disable worker
    dynamis.set('api',api);

    dynamis.set("pattern",{
        "username":["^[A-Za-z0-9_]{6,15}$","requires at least six alpha-numerique character"],
        "pass1":["((?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,20})","requires upperCase, lowerCase, number and a minimum of 6 chars"],
        "pass2":["^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$","requires upperCase, lowerCase, number and a minimum of 6 chars"],
        "password":["(?=^.{6,}$)((?=.*[0-9])|(?=.*[^A-Za-z0-9]+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$","requires upperCase, lowerCase, number and a minimum of 6 chars"],
        "pass3":["^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,}$","requires upperCase, lowerCase, number and a minimum of 6 chars"],
        "fullDate":["(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))","follow the following date format (YYYY-MM-DD)"],
        "phone":["[\(]?[0-9]{3}[\)]?[\-|\ ]?[0-9]{3}[\-|\ ]?[0-9]{4}","follow the format of 011-222-3333"],
        "minMax":["[a-zA-Z0-9]{4,8}","requires at least four to eight character"],
        "number":["[-+]?[0-9]*[.,]?[0-9]+","requires a numberic value"],
        "url":["^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$","requires a valid URL"],
        "colour":["^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$","requires a valid colour in the form of (#ccc or #cccccc)"],
        "bool":["^1|0","requires a boolean value of 0 or 1"],
        "email":["^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$","the email address is not the right formated"],
        "single":["^[a-zA-Z0-9]","requires a single value"]});
    return this;
};
//=============================================================================//
/*
 * @cons:the representation of the console.log
 * @stack:the stack used to display the line number
 * @obj: an array of object are passed and consoled for each
 * @info:permanent,preferably a single line of formated colour text
 * @msg: displays a message on the interphase
 * @deb: the debbuger for all viriables
 * @sync:ajax obj call with the parms {method,format,url,var}
 */
var iyona={
    view: true,
    /**
     * used for system that do not support console to have multiple arguments
     */
    cmd:  function(){
        var l=arguments.length;
        for(var x=0;x<l;x++){
            if(typeof arguments[x]==="function") console.log(encodeURI(arguments[x].toString()));
            else if(typeof arguments[x]==="undefined"||arguments[x]===null){ console.log("<null>");}
            else if (typeof arguments[x]==="object") {for (var index in arguments[x]) console.log(index+'='+arguments[x][index]);}
            else console.log(arguments[x]);
        }
    },
    cons: console.log,
    dir : console.dir,
    /**
     * two arg can be passed a string @msg and an @object
     */
    err: function(){
        arguments[arguments.length++]=this.stack();

        console.warn('%c'+arguments[0]+' '+arguments[arguments.length-1],'background:#ff0000;color:#ececec;width:100%;display:block;font-weight:bold;');
        if(arguments.length>2)console.dir(arguments[1]);
    },
    /**
     * one to three argument can be passed. string @msg, @color, @object
     */
    info: function(){//display information with a color set on argument [1]
        var a=arguments,len = a.length++;
        a[len]=this.stack();
        var col= (typeof a[1]==='string' && isset(a[1]) && a.length>2 )? a[1]:'black';
        var color;//must be a string, not an obj and more than 2 args
        color = 'background:'+col+';color:#efefef;width:100%;display:block;font-weight:bold;';

        console.info('%c'+a[0]+" "+a[len],color);
        if(typeof a[1]!=='string' && a.length>2)console.dir(a[1]);
        else if(typeof a[2]!=='string' && a.length>2)console.dir(a[2]);
    },
    /**
     * display on the notification board
     * @param msg, the string to display
     * @param permanent, if the message is to display permanently
     * @param clss, the class to add, usually a sucess or error class
     * @returns {boolean}
     */
    msg:  function(msg,permanent,clss){
        if(!msg) return;
        this.info(msg);
        clss = (!isset(clss)||clss===true)? "balanced": (clss===false||clss===0)? "assertive": clss;
        clss = (permanent!==true)? clss+" blink_me": clss;
        var notification = _$("#notification");
        var $scopeLayout = notification.scope();

        if(permanent!==true){
            setTimeout(
                function(){
                    if($scopeLayout) $scopeLayout.$apply(function(){$scopeLayout.msg = false;});
                    else notification.html("").removeClass('blink_me');
                },3000);
        }

        if(!$scopeLayout)_$("#notification").html(msg).removeClass().addClass(clss);
        else $scopeLayout.msg = {"text":msg,"clss":clss};
    },
    /**
     * the default messaging, display differently on mobile to desktop
     */
    on:  function(){
        if(this.view===false) return;
        if(!myPlatform.isMobile){
            if(arguments.length>1){
                arguments[arguments.length++]=this.stack();
                arguments[arguments.length++]=new Date().getTime();
                this.cons.apply(console,arguments);
            } else this.dir.apply(console,arguments);
        } else {
            var arg;
            arguments[arguments.length++]=this.stack();
            this.cmd.apply(null,arguments);
        }
    },
    off:  function(){ var x=1;},
    /**
     * {method,format,url,params,callback}
     */
    sync: function(url, data, callback, options){//settings: {url, withCredentials, format, method, params, callback}
      var settings = {};

      if (typeof url === "string") settings.url = url;

      if(arguments.length ===1 && typeof url ==="object") settings = url;
      if(arguments.length>1 && typeof arguments[1]==="object" && arguments[1].params) settings = arguments[1];
      if(arguments.length>2 && typeof arguments[2]==="object" && arguments[2].params) settings = arguments[2];
      if(arguments.length>3 && typeof arguments[3]==="object") settings = arguments[3];

      if(arguments.length>1 && typeof arguments[1]==="object" && !arguments[1].params) settings.params = arguments[1];
      if(arguments.length>1 && typeof arguments[1]==="function") settings.callback = arguments[1];
      if(arguments.length>2 && typeof arguments[2]==="function") settings.callback = arguments[2];


      var defaults = {"method":"post", "format":"json", "url":"", withCredentials:true};
      for (var key in defaults) { settings[key] = isset(settings[key])? settings[key]: defaults[key];}

      var xhr=new XMLHttpRequest(),params;

      xhr.open(settings.method,settings.url,true);
      xhr.withCredentials     = settings.withCredentials;
      xhr.responseType        = settings.format;
      xhr.onreadystatechange  = readyStateChange;

      if(typeof settings.params==="object"){
          xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
          params=settings.params;
      }else{
          params=settings.params;
          xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      };
      if(settings.format==="json"){
          xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");//questionable, to be removed?
          xhr.setRequestHeader("Accept","text/html,application/xhtml+xml,application/xml;application/json;q=0.9,*/*;q=0.8");//used in FF
      }
      xhr.onerror=function(e){
          console.info("Check internet connection");
          console.error('ERROR:: ',e);
      };
      xhr.send(params);

      function readyStateChange(e){
          if(this.readyState===4 && this.status===200){
              var response=this.response||"{}";//@fix:empty object so as to not cause an error
              if(typeof response==="string"&&settings.format==="json" )response=JSON.parse(response);//wen setting responseType to json does not work
              //else response=JSON.parse(response); //@change: if object is not a string, changes are that it is an object already
              if(typeof settings.callback==="function")settings.callback(response);
          }
      }
    },
    /**
     * stack for chrome, to display the last position of the script where it was executed last
     */
    stack:function(){
        var isChrome = myPlatform.isChrome;
        if(isChrome||false){
            var stack = new Error().stack,n=isChrome?3:2;
            var file = stack.split("\n")[n].split("/");
            return '('+file[file.length-1]+')';}
        else{return '';}
    }
};
var mylog = iyona;
//============================================================================//STORAGE
/*
 * used to store to storage to json objects
 */
var dynamis={
  clear:function(_local){
      var isChromeApp=myPlatform.isChromeApp;

      if(isChromeApp && _local===true){chrome.storage.local.clear();}
      else if(isChromeApp && !_local) {chrome.storage.sync.clear();}
      else if(_local)                 {localStorage.clear();}
      else                            {sessionStorage.clear();}//endif
  },
  del:function(_key,_local){
      var isChromeApp=myPlatform.isChromeApp;

      if(isChromeApp && _local===true){chrome.storage.local.remove(_key);sessionStorage.removeItem(_key);}
      else if(isChromeApp && !_local) {chrome.storage.sync.remove(_key);sessionStorage.removeItem(_key);}
      else if(_local)                 {localStorage.removeItem(_key);}
      else                            {sessionStorage.removeItem(_key);}//endif
  },
  get:function(_key,_local){
      var value;
      var isChromeApp=myPlatform.isChromeApp;

      if(isChromeApp && _local===true){chrome.storage.local.get(_key,function(obj){return obj[_key];});value=sessionStorage.getItem(_key);}
      else if(isChromeApp && !_local) {chrome.storage.sync.get(_key,function(obj){return obj[_key];});value=sessionStorage.getItem(_key);}
      else if(_local)                 {value=localStorage.getItem(_key);}
      else                            {value=sessionStorage.getItem(_key);}//endif
      return str2Json(value)||value;
  },
  set:function(_key,_value,_local){//chrome.app.window
      var set={}, string;
      set[_key]       = _value;
      var isChromeApp = myPlatform.isChromeApp;
      string          = (typeof _value==="object")? JSON.stringify(_value): str2Json(value);

      //if(string===false) { iyona.err("The string given is not a valid JSON", value); return false;}//include non JSON?
      if(isChromeApp && _local===true){chrome.storage.local.set(set);sessionStorage.setItem(_key,string);}
      else if(isChromeApp && !_local) {chrome.storage.sync.set(set);sessionStorage.setItem(_key,string);}
      else if(_local)                 {localStorage.setItem(_key,string);}
      else                            {sessionStorage.setItem(_key,string);}//endif
  },
  key:function(key, _local){
    var val = this.get(key, _local);
    return {"set":set};

    function set(k, value){
      val[k] = value;
      this.set(key, val, _local);
    }
  }

};
var myLog = dynamis;


//============================================================================//
// RUN CONFIG
//============================================================================//
(function(){(  new configuration()).config();  })();//run the configurations
var _$=function(element){
    if(typeof element==="string")return angular.element(document.querySelectorAll(element));
    else return angular.element(element);
};
//============================================================================//
//https://spreadsheets.google.com/feeds/cells/1JfaPSPOd7eBgZNI4-d42ZjCeljzjk3s1GH7eze72fbc/od6/public/values?alt=json
