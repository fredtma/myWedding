var WORK = self;
self.importScripts('schema.js');
self.importScripts('methods.js');

self.onconnect = function(e) {
  var port = e.port[0];
  console.log("onConnect", e, e.data, e.port);
}

self.addEventListener('message',function(e){
  var $data      = e.data;
  var $dbName    = $data.dbName;
  var $siteUrl   = $data.siteUrl;
  var $siteApi   = $data.siteApi;
  var $dataUrl   = $data.dataUrl  ||false;
  var $dbVersion = $data.dbVersion||1;
  var $options   = $data.option   ||{};
  var _default   = {};

  $options       = merge(_default, $options);

  switch($data.call){
    case "upgrade":
        iAmDB($dbName, $dbVersion);
      break;

    default:
      break;
  }

  function close(){
    console.log("Closing after finish upgrade:: Timer");
    post('close');
    self.close();
  }

  function backup(idb, callback){
    //@todo: read and backup data to filesystem
    callback();
  }

  function iAmDB(dbName, dbVersion) {
    var idb;
    var iRequest  = self.indexedDB.open(dbName,parseInt(dbVersion));
    var that      = this;
    var upgrading = false;

    iRequest.onblocked        = blocked;
    iRequest.onerror          = error;
    iRequest.onsuccess        = success;
    iRequest.onupgradeneeded  = upgrade;

    function blocked(e){console.log("Closing worker::Please close all other tabls with that application",e);self.close();}

    function error(e){console.log("Closing worker::Database error code: "+e.target.error.message);self.close();}

    function success(e){
      var profile;
      var stores = [];
      console.log("Worker iDB Ready");
      idb = idb || e.target.result || iRequest.result;

      //place the addition of data in seperate loop, in order to prevent `transaction running`
      if(upgrading===true && $dataUrl) {

        for(profile in appSchema()){
           if(profile==='caecus' || profile==='offline') continue;
           stores.push(profile);
        }

        aSync($dataUrl, {}, callback);

        function callback(e){
          var data, key, store, len, x, y, len1, x1, x1;
           if(e && typeof e.notitia==='undefined'){console.log("could not auto update iDB on upgrade",e);return false;}

           data = e.notitia;
           len = stores.length;
           for(x=0; x<len; x++){
              var profile = stores[x];
              if(!data[profile]) continue;

              store = data[profile];
              if(store.found===false || !isset(store.data)){console.log("Store not found "+profile,store); continue;}

              len1  = store.data.length;
              for(x1=0; x1<len1; x1++){
                iWrite(profile, store.data[x], false, close);
              }
           }//endfor
        }//callback

      }//if upgrading
      upgrading=false;
    }

    function upgrade(e){
      var profile;
      var schema;
      var store;
      var pk;
      var current;
      var field;
      var x = 0, l;
      idb = e.target.result || iRequest.result;
      upgrading=true;

      backup(idb, createStores);

      function createStores(){
        for(profile in appSchema()){

          schema  = appSchema()[profile];
          store   = null;
          //console.log("SCHEMA", profile, idb.objectStoreNames.contains(profile), schema);

          if(!schema.hasOwnProperty('properties')) continue;
          if(idb.objectStoreNames.contains(profile)!==true){//new store schema
            console.log("Creating:", profile);

             for(var field in schema.properties){
                if(field.pk && !store) store = iRequest.result.createObjectStore(profile,{keyPath: field});
                else if(!store) store = iRequest.result.createObjectStore(profile,{autoIncrement: true});

                current = schema.properties[field];
                ndx     = current.ndx || current.index || current.key;

                if(current.unique) store.createIndex('uniq_'+field,field,{unique:true});//keyname,keypath
                if(ndx) store.createIndex(ndx,field);
             }//for field in mensa.fields
          }else{//to update the object store's index
            console.log("Updating:", profile);

             store  = (iRequest.transaction)? iRequest.transaction.objectStore(profile): e.currentTarget.transaction.objectStore(profile);
             l      = store.indexNames.length;
             if(true){store.clear();}//removing all records from the object store and removing all records in indexes that reference the object store

             for(; x<l; x++){
               //console.log("INdexName", store.indexNames, store.indexNames[x]);
               if(typeof store.indexNames[x]==='string') store.deleteIndex(store.indexNames[x]);
             }//remove all indexs

             for(field in schema.properties){
                current = schema.properties[field];
                //console.log("Current", field, current);

                ndx     = current.ndx || current.index || current.key;
                try{
                   if(current.unique && !objSearch(store.indexNames,current.unique)) {
                     store.createIndex(current.unique, current.keyPath||field, {unique:true});
                   }
                   if(ndx && !objSearch(store.indexNames, ndx)) {
                     store.createIndex(ndx, current.keyPath||field);
                   }

                   //Index sub field
                   if(current.indexes){
                     var subLen   = current.indexes.length;
                     var subx     = 0;
                     var subIndex;
                     for(; subx < subLen; subx++){
                        subIndex = current.indexes[subx];
                        //console.log("SUB", subIndex);

                        if(subIndex.unique && !objSearch(store.indexNames,subIndex.unique)) {
                          store.createIndex(subIndex.unique, subIndex.keyPath||field, {unique:true});
                        }
                        if(ndx && !objSearch(store.indexNames, ndx)) {
                          store.createIndex(ndx, subIndex.keyPath||field);
                        }
                     }
                   }
                }catch(e){deb("An error occured in creating the index::"+e.message, field,e)}

             }//for field in mensa.fields
          }
          iRequest.transaction.onerror=function(e){deb("A database error code: "+e.target.errorCode,e);}
        }// for in appSchema
      }// createStore func
    }// upgrade func
  }// iAmDB func

  function schemaDecypher(data){ console.log(data);}


});

//@todo: bulk array insert/update
