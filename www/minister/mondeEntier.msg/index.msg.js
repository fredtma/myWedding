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
    sync: function(settings){
        var defaults={"method":"post","format":"json","url":that.url,withCredentials:true};
        for (var key in defaults) { settings[key] = settings[key]||defaults[key];}
        var xhr=new XMLHttpRequest(),params;

        xhr.open(settings.method,settings.url,true);
        xhr.withCredentials     = settings.withCredentials;
        xhr.responseType        = settings.format;
        xhr.onreadystatechange  = readyStateChange;

        if(typeof settings.params==="object"){
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            params=JSON.stringify(settings.params);
        }else{
            params=settings.params;
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        };
        if(settings.format==="json"){
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");//questionable, to be removed?
            xhr.setRequestHeader("Accept","text/html,application/xhtml+xml,application/xml;application/json;q=0.9,*/*;q=0.8");//used in FF
        }
        xhr.onerror=function(e){console.info("Check internet connection");console.error('ERROR:: ',e);};
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