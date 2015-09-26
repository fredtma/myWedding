(function (){
    'use strick';
    angular.module('mondeEntier', []).provider("googleSheetDB",googleSheetDB);

    function googleSheetDB(){
        var that    = this;
        this.url    = "https://spreadsheets.google.com/feeds/cells/1JfaPSPOd7eBgZNI4-d42ZjCeljzjk3s1GH7eze72fbc/od6/public/values?alt=json";
        this.key    = null;
        this.$get   = provider;
        init();

        function provider(){
            return {
                fetch: fetch
            }
            function fetch(){}
        }//this.get


        function init(){
            if(!that.url) {
                console.error("There is not url setup");
                return false;
            }

            if(!that.key && that.url.indexOf("spreadsheet")!==-1) {
                that.key = that.url.match(/cells\/(.*)\//)[1];
            }//endif
            else if(!that.key && that.url.indexOf("key")!==-1) {
                that.key = that.url.match(/key=(.*?)(&|#|$)/)[1];
            }//endelse

            iyona.sync({url: that.url, method: 'get', callback: sheetReturn, withCredentials:false});

            function sheetReturn(response){
                var feeds   = response.feed;
                var item    = {};
                var row, col;
                var author  = {name: feeds.author[0].name['$t'], email: feeds.author[0].email['$t']};
                var sheet   = {modified: feeds.updated['$t'], title: feeds.title['$t'], author: author, rows:{}, cols:{} };

                for(var x=0, l=feeds.entry.length; x<l; x++){
                    item= feeds.entry[x];
                    row = item['gs$cell'].row;
                    col = item['gs$cell'].col;

                    sheet.rows[row]     = sheet.rows[row]||{};
                    sheet.rows[row][col]= item.content['$t'];

                    if(col==1){
                        var name = item.content['$t'].split(" ");
                        //@todo: make name+surname split
                        if(name.length===2);
                    }
                    sheet.cols[col]     = sheet.cols[col]||{};
                    sheet.cols[col][row]= item.content['$t'];
                }
                console.log("Sheet", sheet);
                return sheet;
            }
        }//setup
    }//googleSHeetDB
})();

/*
b&b
*/
