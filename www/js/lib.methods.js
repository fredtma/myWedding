/**
 * Created by fredtma on 2015/06/23.
 */
'use strict';

//============================================================================//
// API FUNCTIONS
//============================================================================//
/**
 * showrcut to make a call to the worker
 * @author fredtma
 * @version 3.2
 * @category worker, background
 * @param object <var>option</var> the option to be passed to the worker
 * @param function <var>callback</var> the function to operate after the worker is done
 * @return void
 */
function WorkerCall(option,callback){
    var ext     =(typeof $!=="undefined")? $.extend: angular.extend;
    var screen  =screen.height*screen.width;
    var profile =userProfile();
    var opt=ext({},
        {
            "username"  :profile.username,
            "_id"       :profile._id,
            "screen"    :screen,
            "SITE_AURA" :sessionStorage.SITE_AURA,
            "DB_VERSION":sessionStorage.DB_VERSION,
            "eternalScope":dynamis.get("eternal",true),
            "DB_NAME"   :sessionStorage.DB_NAME,
            "SITE_API"  :sessionStorage.SITE_API
        },option);//ce si vas limiter l'access a ceux qui sont enregistrer seulment.

    if(dynamis.get('api').Worker&&(profile) ){
        var aWorker;
        if(window.uTesting){aWorker=new Worker("http://localhost:"+window.uTesting+"/absoluteC:/wamp/www/saBirdChecklist/www/minister/worker.notitia.js");}
        else {aWorker=new Worker("js/worker.notitia.js");}

        aWorker.postMessage(opt);
        readWorker(aWorker,callback);
    } else iyona.msg("you are not log in.");
}
//============================================================================//
/**
 * the return value of the worker.
 * @author fredtma
 * @version 3.1
 * @category worker
 * @param object <var>aWorker</var> the worket object
 */
function workerRead(aWorker,callback){
    aWorker.addEventListener('message',function(e){

     //if(e.data==="close"){aWorker.terminate();iyona.info("Terminating Worker");}
        if(callback)callback(e.data,aWorker);
    },false);
    aWorker.addEventListener('error',function(e){
        iyona.err("Worker on strike "+e.message,true);
    },false);
}

//============================================================================//
//FILTERS
//============================================================================//
/**
 * change into alpha numerical, with no spacing
 * @author fredtma
 * @version 0.3
 * @category string
 * @param string <var>the_str</var> the input string to be changed
 * @param boolean <var>transform</var> choses to make it upper case or not
 * @see ucwords
 * @return string
 */
function alphaNumeric(the_str,transform)
{
    the_str   = the_str.toLowerCase();
    the_str   = (transform)?ucwords(the_str): the_str;
    the_str   = the_str.replace(/[^A-Za-z0-9\s]*/ig,'');
    return the_str;
}
//============================================================================//
function ucfirst(word){if(!word)return false; return word.charAt(0).toUpperCase() + word.substring(1);}
//============================================================================//
/**
 * used in a similar way as the php version of ucwordsn
 * @author fredtma
 * @version 0.2
 * @category string
 * @param string <var>str</var> is the string that will be converted
 * @see PHP ucwords
 * @return string
 */
function ucwords(str)
{
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
    });
}//end function

//============================================================================//
// FUNCTIONS
//=============================================================================//
function checkConnection() {
    var networkState;

    if(typeof navigator.connection!=="undefined")networkState = navigator.connection.type;
    else if(typeof navigator.network!=="undefined")networkState = navigator.network.connection.type;
    else networkState = navigator.onLine;

    var states = {}; var Connect=typeof Connection!=="undefined"?Connection:{};
    states[Connect.UNKNOWN] = 'an Unknown connection';
    states[Connect.ETHERNET] = 'an Ethernet connection';
    states[Connect.WIFI] = 'a WiFi connection';
    states[Connect.CELL_2G] = 'a Cell 2G connection';
    states[Connect.CELL_3G] = 'a Cell 3G connection';
    states[Connect.CELL_4G] = 'a Cell 4G connection';
    states[Connect.CELL]     = 'Cell generic connection';
    states[Connect.NONE] = 'with No network connection';

    var tmp = states[networkState]||networkState;
    iyona.info('Connection type is ' + tmp);
    tmp = !tmp||tmp==='none'?false:tmp;

    var config = dynamis.get("SITE_CONFIG");
    sessionStorage.SITE_ONLINE = config.isOnline = tmp?true:false;
    dynamis.set("SITE_CONFIG",config);
    return tmp;

}
//============================================================================//
/**
 * define object property
 * @param {bool} configurable - default false; if not true, the property can't be deleted; attempt to delete is ignored without error!
 * @param {bool} enumerable - default false; if true, it will be iterated in for(var i in theObject); if false, it will not be iterated, but it is still accessible as public
 * @param {function} get - must be a function; its return value is used in reading the property; if not specified, the default is undefined, which behaves like a function that returns undefined
 * @param {function} set - must be a function; its parameter is filled with RHS in assigning a value to property; if not specified, the default is undefined, which behaves like an empty function
 * @param {mixed} value - default undefined; if writable, configurable and enumerable (see below) are true, the property behaves like an ordinary data field
 * @param {bool} writable - default false; if not true, the property is read only; attempt to write is ignored without error!
 * @param {type} obj - the object that will receive the property
 * @param {type} prop - the field of the object
 * @param {type} opt - the options for the property
 * @returns null
 */
function createProperty(obj, prop, opt){
    var curVal = obj[prop];//this overwrite the property
    var tmp = {configurable:true, enumerable: true, value: curVal, writable:true,get:function(){return curVal;},set:function(val){curVal=val;}};
    opt = angular.extend({},tmp,opt);
    Object.defineProperty(obj, prop, opt);
}

//============================================================================//
function exit(msg) {msg = msg||"Something went badly wrong!";if (window.stop)window.stop(); throw new Error(msg);}
//============================================================================//
function fileErrorHandler(e) {
    var msg = '';

    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        default:
            msg = 'Unknown Error';
            break;
    };

    console.log('Error: ' + msg,e);
}
//============================================================================//
/*
 * check if the browser supports html5 validation
 * @author fredtma
 * @version 2.1
 * @category validation,form
 * @return bool
 */
function hasFormValidation() {
    return (typeof document.createElement( 'input' ).checkValidity === 'function');
}
//============================================================================//
/**
 * use prototype to add a function that searches an object value
 * @author fredtma
 * @version 2.3
 * @category search, object
 * @param array </var>value</var> the value to search in the object
 * @return bool
 */
function objSearch(ele,value,field){
    var key,l,found=false,obj;
    if(ele instanceof Array){
        l=ele.length;
        for(key=0;key<l;key++){obj=ele[key];
            found = search(obj,key);
            if(found) return found;
        }
    }
    if(field && isset(ele)){
        obj=ele[field];
        found = search(obj,field);
        if(found) return found;
    }
    for(key in ele ) {obj=ele[key];
        found = search(obj,key);
        if(found) return found;
    }
    function search(obj,key){
        if(typeof obj==='object' )found=objSearch(obj,value,field);
        if(found!==false) return [found,key];
        if(typeof obj==="string"&&obj.indexOf(value)!==-1 ) return [ele,key];
        return false;
    }
    return false;
}
//============================================================================//
//@oldVersion: while (path.length > 1) obj = obj[path.shift()]; return obj[path.shift()] = value;
/**
 * the method will assign a value to the set object from a string path
 * @param {object} obj - the object that will receive the assign value
 * @param {string} path - the path to find in the object
 * @param {*} value -  the value that will be assign to the object
 * @returns {*}
 */
function objSetValue(obj, path, value){
    if(typeof path ==='string'){
        path = path.replace(/\[/g,'.');
        path = path.replace(/\]/g,'');
        path = path.replace(/[^a-zA-Z0-9\.]]/g,'.');
        path = path.split('.');
    }

    var l=path.length,key=path[0];
    if(parseInt(key)) key = parseInt(key);

    if(l===1 && value){ obj[key] = value; return obj[key]; }
    else if(l===0) return obj;
    else {
        //creates new key/values
        if (!obj[key] && typeof key==='number') {obj = []; obj[key] = {};}
        else if(!obj[key]) obj[key] = {};
        return objSetValue(obj[key],path.slice(1),value);
    }
}
//============================================================================//
/**
 * get the size of an object
 *
 * It will verify all the variable sent to the function
 * @author tomwrong
 * @category object,size
 * @see http://stackoverflow.com/questions/1248302/javascript-object-size
 * @return bytes
 */
function objectSize(object) {
    var objectList=[];var stack=[object];var bytes=0; var cnt=0; var i;
    while ( stack.length ) {
        var value = stack.pop();
        if ( typeof value === 'boolean') {bytes += 4;}
        else if(typeof value === 'string') {bytes += value.length * 2;}
        else if(typeof value === 'number') {bytes += 8;}
        else if(typeof value === 'object'&& objectList.indexOf( value ) === -1)
        {
            objectList.push( value );
            for( i in value ){
                stack.push( value[ i ] );
                cnt++;
                if(cnt>500)return bytes;
            }
        }
    }
    return bytes;
}
//============================================================================//
/**
 * load a script dynamically in the header tag
 * @author fredtma *
 * @version 1.2
 * @category dynamic, script
 * @param string <var>url</var> the path of the script to be loaded
 * @param string <var>sync</var> load the script with async option on
 * @return void
 */
function load_script(urls,sync,position,fons){
    iyona.info("LOADS",urls);
    var s,ele,c,url;
    var script=document.createElement('script');
    if(typeof urls==="string") url=urls;
    else {url=urls[0]; urls.shift();}

    s=document.querySelector('script[data-fons]');
    c=document.querySelector('script[src="'+url+'"]');
    if(c)return false;
    if(!position || position==='head')ele=document.getElementsByTagName('head')[0];
    else if(position==='end')ele=document.getElementsByTagName('body')[0];

    if(s)_$(s).remove();//ele.removeChild(s);
    if (sync !== false) script.async = true;
    script.src  = url;script.type="text/javascript";
    if(fons){script.setAttribute('data-fons',fons);}
    script.onreadystatechange = function(e){iyona.info("Loaded script StateChange "+url,e);};
    script.onload = function(){if(typeof urls==="object"&&urls.length>0) load_script(urls,sync,position,fons);};;
    ele.appendChild(script);
}
//============================================================================//
/**
 * used to display message when system sync
 * @param {string} data, the result of the worker
 * @param {object} notitiaWorker, the worker's object
 */
function onlineSync(direction){
    if(sessionStorage.SITE_ONLINE==='true') {
        workerCall({'enkele':true,"sync":direction},callback);
        iyona.msg("The Synchronisation in progress...");}
    else{iyona.msg("You are currently offline");}

    function callback(data, notitiaWorker){
        if(data==="Sync Done")iyona.msg("The Sytem has finished syncing");
        else if(data==="Sync Error")iyona.msg("An error occured while syncing, try again later");
        //notitiaWorker.terminate();
    }
};
//============================================================================//
function mergeDeep(obj1,obj2){ // Our merge function
    var result = {}; // return result
    for(var i in obj1){      // for every property in obj1
        if((i in obj2) && (typeof obj1[i] === "object") && (i !== null)){
            result[i] = mergeDeep(obj1[i],obj2[i]); // if it's an object, merge
        }else{
            result[i] = obj1[i]; // add it to result
        }
    }
    for(i in obj2){ // add the remaining properties from object 2
        if(i in result){ //conflict
            continue;
        }
        result[i] = obj2[i];
    }
    return result;
}
//============================================================================//
function str2Json (jsonString){
    if(typeof jsonString !== "string") return false;
    try {
        var o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns 'null', and typeof null === "object",
        // so we must check for that, too.
        if (o && typeof o === "object" && o !== null) {
            return o;
        }
    }
    catch (e) { }
    return false;
}
//============================================================================//
/**
 * calculate the date difference and returns the value in human language.
 * @author fredtma
 * @version 0.5
 * @category iyona
 * @param array </var>Comment</var> the desc
 * @see get_rich_custom_fields(), $iyona
 * @return void|bool
 * @todo finish the function on this page
 * @uses file|element|class|variable|function|
 */
function timeDifference(t) {
    var minute=1000*60,hour=minute*60,day=hour*24,
        cur=new Date().getTime(),dif,set;
    var time = new Date(t).getTime();
    dif=(cur-time);
    var minutes = Math.ceil(dif/minute);
    if( minutes < 2)        set=Math.ceil(dif/1000)+' Second';
    else if(minutes < 60)   set=minutes+' minute';
    else if(minutes < 60*24)set=Math.ceil(dif/hour)+' hour';
    else set=Math.ceil(dif/day)+' day';
    if(dif>1)set+='s';
    return set;
}
//============================================================================//
/**
 * creates a unique id based upon time
 * @author fredtma
 * @version 1.2
 * @category random,generation
 */
function uniqueID(len,num,date,bin) {
    var possible,
        d = new Date(),text=d.getDate()+''+d.getMonth(),l;
    possible = (num===true)?"0123456789":"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    l    = possible.length;
    len  = len||5;
    text = (date===true)?text:'';

    for( var i=0; i < len; i++ ){
        text += possible.charAt(Math.floor(Math.random() * l));
        if(i%2 && i!=0 && num!==true) {text+=Math.floor(Math.random() * 90)+10;i++;}
    }
    text = (date===true)?text+''+d.getMinutes()+''+d.getHours():text;
    text = (num===true && bin===true)? (+parseInt(text)).toString(2):text;
    return text;
}

//============================================================================//
//VALIDATIONS
//============================================================================//
/*
 * Used to retrieve the value of a variable that is not an object
 */
function isempty(val){
    if(val!==0 && val!=='0' && typeof val!=="undefined" && val!==null && val!=='') return false; else return true;
}
//============================================================================//
/**
 * similar to PHP issset function, it will test if a variable is empty
 * @author fredtma
 * @version 0.8
 * @category variable
 * @return bool
 */
function isset() {
    var a=arguments,l=a.length,i=0;
    if (l===0) {return false;}//end if
    while (i!=l) {if (a[i]===null || typeof(a[i])==='undefined') {return false;} else {i++;}}
    return true;
}//end function
//============================================================================//
/**
 * validate a sets of value againt the first object
 * @returns {Boolean}
 */
function issets(obj,path){
    var path = path.split('.');
    var key;
    while (path.length > 1) {
      key = path.shift();
      if(parseInt(key)) key = parseInt(key);
      obj = obj[key];
    }
    return obj[path.shift()];
}

//============================================================================//
//CLASSES
//============================================================================//

  function GPSlocator(opt){
      var that = this;
      var minutes = 10;
      this.gpsOptions = opt||{enableHighAccuracy: true,maximumAge:1000*60*minutes};
      this.position(myLocation);

      function myLocation(position){
          that.gps = position.coords;
          that.gps.timestamp = position.timestamp;
      }
  }
  /**
   * gets the geolocation of the user based upon HTML5 api
   * @param {object} opt the object containing the option for the geolocation to use
   * @param {function} callback the callback that will receive the geolocation
   * @returns void
   */
  GPSlocator.prototype.position = function getCurrentPosition(callback,opt){

      opt = opt||this.gpsOptions;
      if(typeof navigator.geolocation!=="undefined"){
          navigator.geolocation.getCurrentPosition(callback,this.locationError,opt);
      } else {
          iyona.msg("This device does not support GPS location");
      }
  }
  /**
   * Display a google map location based upon gps location
   * @param {string} id the id of the element where the map will be displayed
   * @param {object} gps the geolocation object
   * @returns void
   */
  GPSlocator.prototype.drawMap = function getMapLocation(id,callback){

      var canvas  = document.getElementById(id);
      var pos     = new google.maps.LatLng(this.gps.latitude,this.gps.longitude);
      var map     = new google.maps.Map(canvas,{zoom:15,center:pos,mapTypeControl:true,navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}, mapTypeId: google.maps.MapTypeId.HYBRID});
      var wind    = new google.maps.InfoWindow({position:pos,map:map,content:"You are here! (accuracy at "+this.gps.accuracy+" meter radius)"});
      if(typeof callback==="function"){ this.getCity(callback); }
//   var marker  = new google.maps.Marker({position: pos, map: map, content:"You are here! (at least within a "+gps.accuracy+" meter radius)"});
  }
  GPSlocator.prototype.getCity = function getMapCity(callback){
      var latLng  = new google.maps.LatLng(this.gps.latitude,this.gps.longitude);
      var geocoder= new google.maps.Geocoder();
      var obj={},x=0,l,node;
      geocoder.geocode({'latLng':latLng},function(results,status){
          iyona.off(results,google.maps.GeocoderStatus.OK,"GPS=",this.gps);
          if(status === google.maps.GeocoderStatus.OK){
              l = results[0].address_components.length;
              obj.address = results[0].formatted_address;
              obj.place_id= results[0].place_id;
              obj.city = {};
              for(;x<l;x++){
                  node = results[0].address_components[x];
                  obj.city[node.types[0]] = node.long_name;
              }
              callback(obj);
          }
      });
  }
  /**
   * the error function used to display when there a geolocation error.
   * @param {int} error the error code from the geolocation api
   * @returns {String} the message
   */
  GPSlocator.prototype.locationError = function locationError(error) {
      var msg;
      switch (error.code) {
          case error.PERMISSION_DENIED:
              msg = "User denied the request for Geolocation.";
              break;
          case error.POSITION_UNAVAILABLE:
              msg = "Location information is unavailable.";
              break;
          case error.TIMEOUT:
              msg = "The request to get user location timed out.";
              break;
          case error.UNKNOWN_ERROR:
              msg = "An unknown error occurred.";
              break;
      }
      return msg+"-"+error.message;
  }

//============================================================================//

  function onPlatform(){
      var that = this;
      return that;
  };
  onPlatform.prototype.isChromeApp= (typeof chrome !== "undefined" && typeof chrome.app.window!=="undefined");
  onPlatform.prototype.isMobile   = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/);
  onPlatform.prototype.isChrome   = navigator.userAgent.indexOf("Chrome") !== -1;
  var myPlatform = new onPlatform();

//============================================================================//

  function userProfile(row,register){
      if(!row){
          row = dynamis.get("USER_NAME",true)? dynamis.get("USER_NAME",true): (dynamis.get("USER_NAME"))? dynamis.get("USER_NAME"): false;
      }
      var user = {
          username   : row.username,
          access     : row.aditum,
          name       : row.name,
          _id        : row.jesua,
          procurator : row.procurator,
          session    : row.sess,
          mail       : row.email,
          avatar     : row.img
      }
      if(row){
          dynamis.set("USER_NAME",user,true);//todo:add the remember me option
      }
      if(register) (new configuration()).config();//when login in run setup of default setting, necessary incase of logoff
      return user;
  }

//============================================================================//
//GOOGLE API USER DETAILS                                                     //
//============================================================================//
function GPLUS_USER() {
    // @corecode_begin getProtectedData
    // this.access_token; 
    // this.user_info; 
    // this.callFunction;//public
    var callback,retry,that=this;//private
    this.getToken = function(method, url, interactive, callBack) {
        retry = false;
        callback = callBack;
        chrome.identity.getAuthToken({"interactive": interactive}, function(token) {
            if (chrome.runtime.lastError) {
                callback(chrome.runtime.lastError); return;
            }
            that.access_token = token;
            that.requestStart(method, url);
        });
    };

    this.requestStart = function(method, url) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Authorization', 'Bearer ' + this.access_token);
        xhr.onload = this.requestComplete;
        xhr.send();
    };

    this.requestComplete = function() {
        if (this.status === 401 && retry) {
            retry = false;
            chrome.identity.removeCachedAuthToken({token: this.access_token}, this.getToken);
        } else {
            callback(null, this.status, this.response);
        }
    };

    this.getUserInfo = function(interactive,callFunction) {
        this.callFunction=callFunction;
        this.getToken('GET', 'https://www.googleapis.com/plus/v1/people/me', interactive, this.onUserInfoFetched);
    };

    this.onUserInfoFetched = function(error, status, response) {
        if (!error && status === 200) {
            that.user_info = JSON.parse(response);//displayName,image
            that.callFunction(that.user_info,that.access_token,true);
            iyona.on("AUTO LOGIN",that.user_info,that.access_token);
        } else {
            that.user_info = {"id":0,"type":0,"emails":[{"value":0}]};
            that.callFunction(that.user_info,error, false);
            iyona.log("could not retrive user data:"+error.message,false,"danger",error,response);
        }
    };

    this.revokeToken = function() {
        chrome.identity.getAuthToken({'interactive': false},
            function(current_token) {
                if (!chrome.runtime.lastError) {
                    chrome.identity.removeCachedAuthToken({token: current_token},
                        function() {
                        });
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' + current_token);
                    xhr.send();
                }
            });
    };
};
//============================================================================//
//FETCH IMAGE
//============================================================================//
function GET_IAMGE(url,ele) {
    this.fetchImageBytes = function(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = this.onImageFetched;
        xhr.send();
    };
    this.onImageFetched = function(e) {
        if (this.status !== 200) return;
        var imgElem = document.createElement('img');
        var objUrl  = window.webkitURL.createObjectURL(this.response);
        imgElem.src = objUrl;
        var element = document.querySelector(ele);element.appendChild(imgElem);
        imgElem.onload = function() {window.webkitURL.revokeObjectURL(objUrl);};
    };
    this.fetchImageBytes(url);
}

//============================================================================//
