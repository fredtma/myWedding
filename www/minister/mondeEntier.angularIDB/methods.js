//============================================================================//
function aSync(url, data, callback, options) { //settings: {url, withCredentials, format, method, params, callback}
  var settings = {};

  if (typeof url === "string") settings.url = url;

  if (arguments.length === 1 && typeof url === "object") settings = url;
  if (arguments.length > 1 && typeof arguments[1] === "object" && arguments[1].params) settings = arguments[1];
  if (arguments.length > 2 && typeof arguments[2] === "object" && arguments[2].params) settings = arguments[2];
  if (arguments.length > 3 && typeof arguments[3] === "object") settings = arguments[3];

  if (arguments.length > 1 && typeof arguments[1] === "object" && !arguments[1].params) settings.params = arguments[1];
  if (arguments.length > 1 && typeof arguments[1] === "function") settings.callback = arguments[1];
  if (arguments.length > 2 && typeof arguments[2] === "function") settings.callback = arguments[2];


  var defaults = {
    "method": "post",
    "format": "json",
    "url": "",
    withCredentials: true
  };
  for (var key in defaults) {
    settings[key] = isset(settings[key]) ? settings[key] : defaults[key];
  }

  var xhr = new XMLHttpRequest(),
    params;

  xhr.open(settings.method, settings.url, true);
  xhr.withCredentials = settings.withCredentials;
  xhr.responseType = settings.format;
  xhr.onreadystatechange = readyStateChange;

  if (typeof settings.params === "object") {
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    params = settings.params;
  } else {
    params = settings.params;
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  };
  if (settings.format === "json") {
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); //questionable, to be removed?
    xhr.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;application/json;q=0.9,*/*;q=0.8"); //used in FF
  }
  xhr.onerror = function (e) {
    console.info("Check internet connection");
    console.error('ERROR:: ', e);
  };
  xhr.send(params);

  function readyStateChange(e) {
    if (this.readyState === 4 && this.status === 200) {
      var response = this.response || "{}"; //@fix:empty object so as to not cause an error
      if (typeof response === "string" && settings.format === "json") response = JSON.parse(response); //wen setting responseType to json does not work
      //else response=JSON.parse(response); //@change: if object is not a string, changes are that it is an object already
      if (typeof settings.callback === "function") settings.callback(response);
    }
  }
}
//============================================================================//
function deb() {
  var l = arguments.length, variable, line, tmp;
  var isMobile = false;
  if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) isMobile = true;

  if (!isMobile) {
    console.dir(arguments);
    return false;
  }

  var isChrome = navigator.userAgent.indexOf("Chrome") !== -1;
  if (isChrome || false) {
    var stack = new Error().stack,
      n = isMobile ? 2 : isChrome ? 3 : 2;
    var file = stack.split("\n")[n].split("/");
    line = '(' + file[file.length - 1] + ')';
  } else {
    return '';
  }

  for (var x = 0; x < l; x++) {
    variable = arguments[x];
    if (typeof variable === "function") variable = encodeURI(variable.toString());
    else if (typeof variable === "undefined" || variable === null) {
      variable = "<null>";
    } else if (variable instanceof Array) {
      tmp = '[';
      for (var a = 0; a < variable.length; a++) tmp += variable[a] + ", ";
      variable = (tmp.lenght > 2) ? tmp.slice(0, -2) + ']' : '[]';
    } else if (typeof variable === "object") {
      tmp = '{';
      for (var ndx in variable) tmp += ndx + ': ' + variable[ndx] + ", ";
      variable = (tmp.lenght > 2) ? tmp.slice(0, -2) + '}' : '{}';
    }
    console.log("[" + x + "]" + JSON.stringify(variable));
  }
  console.log("===============================================================" + line);
}
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
function issets(obj, path){
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
function merge(obj1, obj2) {
  var obj3 = {};
  var attrname;
  for (attrname in obj1) {
    obj3[attrname] = obj1[attrname];
  }
  for (attrname in obj2) {
    obj3[attrname] = obj2[attrname];
  }
  return obj3;
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
function objSearch(ele,value,field) {

    var key, l, found=false, obj;
    if(ele instanceof Array){
        l=ele.length;
        for(key=0;key<l;key++){
          obj   = ele[key];
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
function post() {
  var l = arguments.length,
    variable;
  for (var x = 0; x < l; x++) {
    variable = typeof arguments[x] === "function" ? encodeURI(arguments[x].toString()) : arguments[x];
    variable = typeof variable === "string" ? variable : JSON.stringify(variable);
    WORK.postMessage(variable);
  }
}
//============================================================================//
