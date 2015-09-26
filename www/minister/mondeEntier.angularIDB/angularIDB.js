(function () {
    'use strick';
    aWorker = new Worker("minister/mondeEntier.angularIDB/worker.js");

    angular.module('mondeEntier', [])
        .provider('angularIDB', angularIDB);

    function angularIDB() {
        var that    = this;
        var $idb    = {};
        var $promise= {}; //this will be a promise containing the indexedDB database on success

        this.dbName         = 'localIDB';
        this.dbVersion      = 24;
        this.responseType   = "json";
        this.reset          = false;
        this.$get           = provider;
        init();

        provider.$inject = ["$q"];

        function provider($q) {//derick albert

            return {
                init:           alpha,
                offlineStorage: offlineStorage,
                post:           post,
                principio:      principio,
                verify:         verify //general function used to verify the server received data.
            };

            function alpha(_store, _options) {
                var transaction, objectStore, request;
                var store   = _store || null;
                var inner   = this;
                var options = angular.extend({
                    console: {
                      viewWrite: false,
                      viewRead:   false
                    }
                }, _options);

                $promise.abort  = function(){transaction.abort();};
                $promise.clear  = function(){return promising.apply(inner, [iClear, arguments]); };
                $promise.get    = function(){return promising.apply(inner, [iRead, arguments]); };
                $promise.post   = function(){return promising.apply(inner, [iWrite, arguments]); };
                $promise.put    = function(){return promising.apply(inner, [iModify, arguments]); };
                $promise.rem    = function(){return promising.apply(inner, [iErase, arguments]); };

                return $promise;

                //=========================================================================//
                function iClear(_store, _callback){
                  var args = override(_store, _index, _callback);
                  var deferred= $q.defer(),
                        promise = deferred.promise;

                  if(!setupTransaction(args.store, "readwrite")) return false;//setups: transaction, objectStore
                  request = objectStore.clear();
                  request.onerror   = error;
                  request.onsuccess = success;

                  function error(e){ console.log("An error occured while clearing:"+args.store, e); deferred.reject(e);}
                  function success(e){
                    console.log("Successfully deleted store :"+args.store, e);
                    deferred.resolve(true);
                    if(typeof args.callback === "function") args.callback(e);
                  }
                  return promise;
                }
                //=========================================================================//
                //@todo: use regex for wildcard, loop cursor for regexp
                function filterQuery(index, objectStore){
                    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
                    var ndx         = null;
                    var order       = 'next';
                    var keyRange    = null;
                    var isCursor    = false;
                    var using       = {};
                    //FOR PK
                    if ((typeof index === "number" || typeof index === "string")) {
                        request   = objectStore.get(index);
                        using.get = index;
                    }
                    //For search
                    else if (typeof index === "object") {
                        //GET NDX NAME
                        if (index.hasOwnProperty("where")) {
                            ndx         = objectStore.index(index.where);
                            using.where = index.where;
                        }
                        //Order by
                        if (index.hasOwnProperty("order")) {
                            order       = (index.order.search(/desc/i) !== -1 || index.order === -1) ? 'prev' : 'next';
                            using.order = index.order;
                        }
                        //limit top | higher than | equal to higher then | gte
                        if ( (index.hasOwnProperty("top")||index.hasOwnProperty("$gte")) && ndx) {
                            isCursor  = true;
                            keyRange  = IDBKeyRange.lowerBound(index.top);
                            request   = ndx.openCursor(keyRange, order);
                            using.top = index.top;
                        }
                        //limit top | higher then | gt
                        if ( (index.hasOwnProperty("top")||index.hasOwnProperty("$gt")) && ndx) {
                            isCursor  = true;
                            keyRange  = IDBKeyRange.lowerBound(index.top, true);
                            request   = ndx.openCursor(keyRange, order);
                            using.top = index.top;
                        }
                        //limit bottom | lower than | equal to lower then | lte
                        if ( (index.hasOwnProperty("bot")||index.hasOwnProperty("lte")) && ndx) {
                            isCursor  = true;
                            keyRange  = IDBKeyRange.upperBound(index.bot);
                            request   = ndx.openCursor(keyRange, order);
                            using.bot = index.bot;
                        }
                        //limit bottom | lower than
                        if ( (index.hasOwnProperty("low")||index.hasOwnProperty("lt")) && ndx) {
                            isCursor  = true;
                            keyRange  = IDBKeyRange.upperBound(index.bot, true);
                            request   = ndx.openCursor(keyRange, order);
                            using.bot = index.bot;
                        }
                        //between | gte & lte
                        if ((index.hasOwnProperty("between") || index.hasOwnProperty("within")) && ndx) {
                            isCursor      = true;
                            if(index.hasOwnProperty("between")) keyRange  = IDBKeyRange.bound(index.between[0], index.between[1], true, true);
                            if(index.hasOwnProperty("within")) keyRange   = IDBKeyRange.bound(index.between[0], index.between[1]);//equal to
                            request       = ndx.openCursor(keyRange, order);
                            using.between = index.between;
                        }
                        //FIRST GET INDEX:: where field1=value | where+equals=single
                        if (index.hasOwnProperty("equals") && ndx) {
                            request   = ndx.get(index.equals);
                            using.is  = index.equals;
                        }
                        //FIRST GET INDEX:: where field1=value | where+is=cursor
                        if (index.hasOwnProperty("is") && ndx) {
                            isCursor  = true;
                            index.is  = IDBKeyRange.only(index.is);
                            request   = ndx.openCursor(index.is, order);
                            using.is  = index.is;
                        }
                        //where like...
                        if (index.hasOwnProperty("like") && ndx) {
                            keyRange  = IDBKeyRange.bound(index.like, index.like + '\uffff');
                            request   = ndx.openCursor(keyRange, order);
                            isCursor  = true;
                            using.like= index.like;
                        }
                    }
                    //where field1=value1 and field2=value2
                    else if (index instanceof Array) {
                        isCursor    = true;
                        request     = objectStore.openCursor(index);
                        using.array = index;
                    }

                    if (ndx) {
                        request   = ndx.openCursor(keyRange, order);
                        isCursor  = true;
                        using.ndx = index;
                    } else if (!ndx && localStorage.eternal) {
                        var creation  = JSON.parse(localStorage.eternal)[args.store].creation,
                            field     = Object.keys(creation)[0],
                            node      = creation[field],
                            indexOrder= (node.unique) ? 'uniq_' + field : node.ndx;
                        /*off*/
                        console.log("INDEX", creation, field, node, indexOrder);
                        request   = objectStore.index(indexOrder).openCursor(keyRange, order);
                        isCursor  = true;
                        using.all = index;
                    } else if(!request) {
                        if(objectStore.getAll){
                          request = objectStore.getAll();
                        } else {
                          request = objectStore.openCursor(keyRange, order);
                        }
                    }
                  return request;
                }
                //=========================================================================//
                function iErase(_store, _index, _callback) {
                    var args = override(_store, _index, _callback);
                    var deferred= $q.defer(),
                        promise = deferred.promise;

                    if (!$idb.db) {
                        waitForIdb(function () {
                            iErase(agrs.index, agrs.callback);
                        });
                        deferred.reject(false);
                        return promise;
                    }
                    if(!setupTransaction(args.store, "readwrite")) return false;//setups: transaction, objectStore

                    request           = objectStore.delete(agrs.index);
                    request.onsuccess = success;
                    request.onerror   = error;

                    function success(e) {
                        console.info("Successfully iErased record " + agrs.index + " on " + agrs.store + ".");
                        offlineStorage({
                            "_id": agrs.index
                        }, agrs.store, 'delete');
                        if (agrs.callback) agrs.callback(e);
                        deferred.resolve(e);
                    }

                    function error(e) {
                        console.error("failed to deleted record.", e);
                        deferred.reject([request.error, agrs.store, e]);
                    }
                    return promise;
                }
                //=========================================================================//
                function iModify(_store, _data, _callback) {
                    iWrite(_store, _data, _callback, true);
                }
                //=========================================================================//
                /**
                search includes [where+equals=single, where+is=cursor, where+like, order, top, bottom, between, equals]
                */
                function iRead(_store, _index, _callback) {
                    var args    = override(_store, _index, _callback);
                    var deferred= $q.defer(),
                        promise = deferred.promise,
                        result  = [];

                    if (!$idb.db) {
                        waitForIdb(function () {
                            iRead(agrs.index, agrs.callback);
                        });
                        deferred.reject(false);
                        return promise;
                    }
                    if(!setupTransaction(args.store, "readonly")) return false;//setups: transaction, objectStore
                    request = filterQuery(args.index, objectStore);

                    request.onsuccess       = success;
                    request.oncomplete      = complete;
                    request.onerror         = error;
                    transaction.oncomplete  = completed;

                    function success(e) {
                        var cursor = e.target.result;
                        /*off*/
                        console.log('CURSOR', isCursor, _index, cursor, e);

                        if (cursor && isset(cursor.value)) {
                            result.push(cursor.value);
                            cursor.continue();
                        } else if (cursor) {
                            result.push(cursor);
                        }
                    }

                    function complete(e) {
                        if (options.console.viewRead) console.log("Successfully iRead to " + args.store, using, e);
                    }

                    function completed(e) {
                        console.info("Successfully iRead transaction " + _index + " to " + args.store, using);
                        if (typeof args.callback === 'function') args.callback(result, isCursor);
                        deferred.resolve(result, isCursor);
                    }

                    function error(e) {
                        console.error("Error while writing to " + args.store + "::" + request.error, e);
                        deferred.reject([request.error, args.store, e]);
                    }
                    return promise;
                }
                //=========================================================================//
                function iWrite(_store, _data, _callback, _update) {
                    var crud;
                    var request;
                    var args = override(_store, _data, _callback, _update);
                    var deferred = $q.defer(),
                        promise = deferred.promise;

                    if (!$idb.db) {
                        waitForIdb(function () {
                            iWrite(args.data, args.callback, args.update);
                        });
                        deferred.reject(false);
                        return promise;
                    }
                    if(!setupTransaction(args.store, "readwrite")) return false;//setups: transaction, objectStore

                    if (typeof args.data !== "object") {
                        console.error("No iData", args.data);
                        deferred.reject(args.data);
                        return promise;
                    }

                    if (!args.update) {
                        request = objectStore.add(args.data);
                        crud = 'post';
                    } else {
                        request = objectStore.put(args.data);
                        crud = 'put';
                    }
                    request.onsuccess       = success;
                    request.onerror         = error;
                    transaction.oncomplete  = complete;

                    function success(e) {
                        if (options.console.viewWrite === true) console.info("Successfully " + crud + " write to " + args.store, args.data);
                        offlineStorage(args.data, args.store, crud);
                        if (typeof args.callback === 'function') args.callback(e);
                        deferred.resolve(e);
                    }

                    function complete(e) {
                        console.log("Successfully completed write transaction to " + args.store + "::", e);
                    }

                    function error(e) {
                        console.error("Error while writing to " + args.store + "::" + e.target.error.message, _data);
                        deferred.reject([e.target.error.message, args.store, _data, e]);
                    }

                    return promise;
                }
                //=========================================================================//
                function override() {
                    var index, callme, _store, update, args = arguments;

                    if (typeof args[0] === "string") _store = args[0];
                    if (typeof args[0] === "object") index = args[0];
                    if (typeof args[1] === "object") index = args[1];
                    if (typeof args[1] === "function") callme = args[1];
                    if (typeof args[2] === "function") callme = args[2];
                    if (typeof args[2] === "boolean") update = args[2];
                    if (typeof args[3] === "boolean") update = args[3];
                    _store = _store||store;
                    return {store:_store, index:index, callback:callme, data:index, update:update};
                }
                //=========================================================================//
                function promising(callback, args) {
                    var deferred = $q.defer(),
                        promise = deferred.promise, result;

                    if($idb.db) return callback.apply($idb, args);
                    else {
                        console.log("Waiting on IDB ready...");
                        $idb.iRequest.addEventListener('success', success, false);
                        //document.addEventListener("IDBReady",success);
                        function success(e){
                          console.log("event", e);
                          result = callback.apply(inner, args);
                          deferred.resolve(result);
                        }
                    }
                  return promise;
                }
                //=========================================================================//
                function setupTransaction(_store, _readWrite) {
                    var deferred = $q.defer();
                    var readWrite= _readWrite||"readwrite";

                    _store            = _store||store;
                    transaction       = $idb.db.transaction(_store, readWrite);
                    objectStore       = transaction.objectStore(_store);

                    transaction.onabort   = aborted;
                    transaction.oncomplete= completed;
                    transaction.onerror   = error;

                    if ($idb.db.objectStoreNames.contains(_store) !== true) {
                        console.error("iErase No store iFound: " + _store);
                        return false;
                    }

                    function aborted(e){
                      if(option.console.debug) console.log("Transaction has been aborted");
                    }

                    function completed(e) {
                        if(option.console.debug) console.info("Successful transaction on "+_store);
                    }

                    function error(e) {
                      if(option.console.debug) console.error("Failed transaction on "+_store, e);
                      deferred.reject(false);
                    }

                  return deferred.promise;
                }
                //=========================================================================//
                function waitForIdb(callback) {
                    console.log("Waiting on IDB ready...");
                    promising(callback);
                }
                //=========================================================================//
            }

            function offlineStorage() {}

            function post() {}

            function principio() {}

            function verify() {}
        }

        function init() {
            emitWorker({"call":"upgrade"}, function(data, aWorker){
              console.log("WORKER::-", data);
            });

            var indexedDB   = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
            var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

            $idb.iRequest           = indexedDB.open(that.dbName);
            $idb.iRequest.onerror   = error;
            $idb.iRequest.onblocked = blocked;
            $idb.iRequest.addEventListener('success', success, false);

            if (that.reset) indexedDB.deleteDatabase(that.dbName);

            function success(e) {
                $idb.db = $idb.iResult || e.target.result || $idb.iRequest.result;
                console.info("Front End iDB Ready");
            }

            function error(e) {
                console.error("Database error code: " + e.target.error.message, e);
            }

            function blocked() {
                console.log("Database is blocked, please close all other tabls with that application");
            }
        }

        function emitWorker(_options, callback){

            var options = {
              dbName:     that.dbName,
              dbVersion:  that.dbVersion,
              siteUrl:    sessionStorage.SITE_URL,
              siteApi:    sessionStorage.SITE_API,
              dataUrl:    false
            };

            angular.extend(options, _options);
            aWorker.postMessage(options);
            aWorker.addEventListener('message',function(e){
              if(callback) callback(e.data,aWorker);
              if(e.data.call==="close") aWorker.terminate();
              //aWorker.terminate();
            }, false);
            aWorker.addEventListener('error',function(e){
                console.error("Worker on strike "+e.message,e);
            },false);
        }
    }
})();
