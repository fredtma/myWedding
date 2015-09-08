(function () {
    'use strick';
    angular.module('mondeEntier', [])
        .provider('angularIDB', angularIDB);

    function angularIDB() {
        var that = this;
        var $idb = {};
        var $promise = {}; //this will be a promise containing the indexedDB database on success

        this.dbName = 'localIDB';
        this.dbVersion = 1;
        this.dbDescription = 'Local index database';
        this.dbReady = false;
        this.dbSize = 15;
        this.dbLimit = 20;
        this.responseType = "json";
        this.reset = false;
        this.$get = provider;
        init();

        provider.$inject = ["$q"];

        function provider($q) {

            return {
                init: setIndexeddb,
                offlineStorage: offlineStorage,
                post: post,
                principio: principio,
                verify: verify //general function used to verify the server received data.
            };

            function init(_store, _options) {
                var store = _store || null;
                var options = angular.merge({
                    allWrite: false,
                    allMessages: true
                }, _options);

                $promise.delete = promising.apply(this, iErase, arguments);
                $promise.get = promising.apply(this, iRead, arguments);
                $promise.post = promising.apply(this, iWrite, arguments);
                $promise.put = promising.apply(this, iModify, arguments);
                return $promise;

                //=========================================================================//
                function iErase(_store, _index, _callback) {
                    var args = override(_store, _index, _callback);
                    var deferred = $q.defer(),
                        promise = deferred.promise;

                    if (!$idb.db) {
                        waitForIdb(function () {
                            iErase(agrs.index, agrs.callme);
                        });
                        deferred.reject(false);
                        return promise;
                    }
                    if ($idb.db.objectStoreNames.contains(store) !== true) {
                        console.error("iErase No store iFound: " + _store);
                        deferred.reject(false);
                    }

                    var transaction = $idb.db.transaction(store, "readwrite");
                    var objectStore = transaction.objectStore(store);
                    var request = objectStore.delete(_index);
                    request.onsuccess = success;
                    request.onerror = error;

                    function success(e) {
                        console.info("Successfully iErased record " + _index + " on " + store + ".");
                        offlineStorage({
                            "_id": _index
                        }, _store, 'delete');
                        if (agrs.callme) args.callme(e);
                        deferred.resolve(e);
                    }

                    function error(e) {
                        console.error("failed to deleted record.", e);
                        deferred.reject([request.error, store, e]);
                    }
                    return promise;
                }
                //=========================================================================//
                /**
                search includes [where+equals=single, where+is=cursor, where+like, order, top, bottom, between, equals]
                */
                function iRead(_store, _index, _callback) {
                    var args = override(_store, _index, _callback);
                    var deferred = $q.defer(),
                        promise = deferred.promise,
                        isCursor = false,
                        using = {},
                        result = [];

                    if (!$idb.db) {
                        waitForIdb(function () {
                            iRead(agrs.index, agrs.callme);
                        });
                        deferred.reject(false);
                        return promise;
                    }
                    if ($idb.db.objectStoreNames.contains(store) !== true) {
                        console.error("iRead No store iFound: " + _store);
                        deferred.reject(false);
                    }

                    var transaction = $idb.db.transaction(store, "readonly"),
                        request;
                    var objectStore = transaction.objectStore(store);
                    var ndx = null;
                    var order = 'next';
                    var keyRange = null;
                    //FOR PK
                    if ((typeof _index === "number" || typeof _index === "string")) {
                        request = objectStore.get(_index);
                        using.get = _index;
                    }
                    //For search
                    else if (typeof _index === "object") {
                        //GET NDX NAME
                        if (_index.hasOwnProperty("where")) {
                            ndx = objectStore.index(_index.where);
                            using.where = _index.where;
                        }
                        //Order by
                        if (_index.hasOwnProperty("order")) {
                            order = (_index.order.search(/desc/i) !== -1 || _index.order === -1) ? 'prev' : 'next';
                            using.order = _index.order;
                        }
                        //limit top
                        if (_index.hasOwnProperty("top") && ndx) {
                            isCursor = true;
                            keyRange = IDBKeyRange.lowerBound(_index.top);
                            request = ndx.openCursor(keyRange, order);
                            using.top = _index.top;
                        }
                        //limit bottom
                        if (_index.hasOwnProperty("bot") && ndx) {
                            isCursor = true;
                            keyRange = IDBKeyRange.upperBound(_index.bot);
                            request = ndx.openCursor(keyRange, order);
                            using.bot = _index.bot;
                        }
                        //between
                        if (_index.hasOwnProperty("between") && ndx) {
                            isCursor = true;
                            keyRange = IDBKeyRange.bound(_index.between[0], _index.between[1], true, true);
                            request = ndx.openCursor(keyRange, order);
                            using.between = _index.between;
                        }
                        //FIRST GET INDEX:: where field1=value
                        if (_index.hasOwnProperty("equals") && ndx) {
                            request = ndx.get(_index.is);
                            using.is = _index.is;
                        }
                        //FIRST GET INDEX:: where field1=value
                        if (_index.hasOwnProperty("is") && ndx) {
                            isCursor = true;
                            request = ndx.openCursor(_index.is, order);
                            using.is = _index.is;
                        }
                        //where like...
                        if (_index.hasOwnProperty("like") && ndx) {
                            keyRange = IDBKeyRange.bound(_index.like, _index.like + '\uffff');
                            request = ndx.openCursor(keyRange, 'prev');
                            isCursor = true;
                            using.like = _index.like;
                        }
                    }
                    //where field1=value1 and field2=value2
                    else if (_index instanceof Array) {
                        isCursor = true;
                        request = objectStore.openCursor(_index);
                        using.array = _index;
                    } else if (ndx) {
                        request = ndx.openCursor(keyRange, order);
                        isCursor = true;
                        using.ndx = _index;
                    } else if (!ndx) {
                        var creation = JSON.parse(localStorage.eternal)[store].creation,
                            field = Object.keys(creation)[0],
                            node = creation[field],
                            indexOrder = (node.unique) ? 'uniq_' + field : node.ndx;
                        /*off*/
                        console.log("INDEX", creation, field, node, indexOrder);
                        request = objectStore.index(indexOrder).openCursor(null, order);
                        isCursor = true;
                        using.all = _index;
                    } else {
                        request = objectStore.openCursor(keyRange, order);
                    }

                    request.onsuccess = success;
                    request.oncomplete = complete;
                    request.onerror = error;
                    transaction.oncomplete = completed;

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
                        if (options.allMessages) console.log("Successfully iRead to " + store, using, e);
                    }

                    function completed(e) {
                        console.info("Successfully iRead transaction " + _index + " to " + store, using);
                        if (typeof args.callme === 'function') args.callme(result, isCursor);
                        deferred.resolve(result, isCursor);
                    }

                    function error(e) {
                        console.error("Error while writing to " + store + "::" + request.error, e);
                        deferred.reject([request.error, store, e]);
                    }
                    return promise;
                }
                //=========================================================================//
                function iWrite(_store, _data, _callback, _update) {
                    var crud;
                    var request;
                    var args = override(_store, _callback, _data, _update);
                    var deferred = $q.defer(),
                        promise = deferred.promise;

                    if (!$idb.db) {
                        waitForIdb(function () {
                            iWrite(_data, agrs.callme, args.update);
                        });
                        deferred.reject(false);
                        return promise;
                    }
                    if ($idb.db.objectStoreNames.contains(store) !== true) {
                        console.error("iWrite No store iFound: " + _store);
                        deferred.reject(false);
                    }

                    var transaction = $idb.db.transaction(store, "readwrite");
                    var objectStore = transaction.objectStore(store);

                    if (typeof _data !== "object") {
                        console.error("No iData", _data);
                        deferred.reject(_data);
                        return promise;
                    }

                    if (!args.update) {
                        request = objectStore.add(_data);
                        crud = 'post';
                    } else {
                        request = objectStore.put(_data);
                        crud = 'put';
                    }
                    request.onsuccess = success;
                    request.onerror = error;
                    transaction.oncomplete = complete;

                    function success(e) {
                        if (options.allWrite === true) console.info("Successfully " + crud + " write to " + store, _data);
                        offlineStorage(_data, _store, crud);
                        if (typeof args.callme === 'function') args.callme(e);
                        deferred.resolve(e);
                    }

                    function complete(e) {
                        console.log("Successfully completed write transaction to " + store + "::", e);
                    }

                    function error(e) {
                        console.error("Error while writing to " + store + "::" + e.target.error.message, _data);
                        deferred.reject([e.target.error.message, store, _data, e]);
                    }

                    return promise;
                }
                //=========================================================================//
                function iModify(_store, _data, _callback) {
                    iWrite(_store, _data, _callback, true);
                }
                //=========================================================================//
                function override(args) {
                    var index, callme;
                    if (typeof args[0] === "string") store = args[0];
                    if (typeof args[0] === "object") index = args[0];
                    if (typeof args[1] === "object") index = args[1];
                    if (typeof args[1] === "function") callme = args[1];
                    if (typeof args[2] === "function") callme = args[2];
                    return {
                        index: index,
                        callme: callme,
                        update: args[3]
                    };
                }
                //=========================================================================//
                function promising(callback, args) {
                    if($idb.db) callback.apply(null, args);
                    else {
                        console.log("Waiting on IDB ready...");
                        document.addEventListener("IDBReady",callback.apply(null, args));
                    }
                }
                //=========================================================================//
                function waitForIdb(callback) {
                    console.log("Waiting on IDB ready...");
                    // document.addEventListener("IDBReady",callback);
                    $promise.then(callback);
                }
                //=========================================================================//
            }

            function offlineStorage() {}

            function post() {}

            function principio() {}

            function verify() {}
        }

        function init() {
            var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
            var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
            
            $idb.iRequest = indexedDB.open(that.dbName);
            $idb.iRequest.onsuccess = success;
            $idb.iRequest.onerror = error;
            $idb.iRequest.onblocked = blocked;
            if (that.reset) indexedDB.deleteDatabase(sessionStorage.DB_NAME);

            function success(e) {
                $idb.db = $idb.iResult || e.target.result || $idb.iRequest.result;
                console.info("Front End iDB Ready");
            }

            function error(e) {
                console.error("Database error code: " + e.target.error.message, e);
            }

            function blocked() {
                console.log("Please close all other tabls with that application");
            }
        }
    }
})();
