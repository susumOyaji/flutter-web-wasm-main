/*
  2022-09-19

  The author disclaims copyright to this source code.  In place of a
  legal notice, here is a blessing:

  *   May you do good and not evil.
  *   May you find forgiveness for yourself and forgive others.
  *   May you share freely, never taking more than you give.

  ***********************************************************************

  A basic demonstration of the SQLite3 "OO#1" API.
*/
'use strict';
(function(){
  /**
     Set up our output channel differently depending
     on whether we are running in a worker thread or
     the main (UI) thread.
  */
  let logHtml;
  if(self.window === self /* UI thread */){
    console.log("Running demo from main UI thread.");
    logHtml = function(cssClass,...args){
      const ln = document.createElement('div');
      if(cssClass) ln.classList.add(cssClass);
      ln.append(document.createTextNode(args.join(' ')));
      document.body.append(ln);
    };
  }else{ /* Worker thread */
    console.log("Running demo from Worker thread.");
    logHtml = function(cssClass,...args){
      postMessage({
        type:'log',
        payload:{cssClass, args}
      });
    };
  }
  const log = (...args)=>logHtml('',...args);
  const warn = (...args)=>logHtml('warning',...args);
  const error = (...args)=>logHtml('error',...args);

  const demo1 = function(sqlite3){
    const capi = sqlite3.capi/*C-style API*/,
          oo = sqlite3.oo1/*high-level OO API*/;
    log("3...sqlite3 version",capi.sqlite3_libversion(), capi.sqlite3_sourceid());
    const db = new oo.DB("/mydb.sqlite3",'ct');
    log("4...transient db =",db.filename);
    /**
       Never(!) rely on garbage collection to clean up DBs and
       (especially) prepared statements. Always wrap their lifetimes
       in a try/finally construct, as demonstrated below. By and
       large, client code can entirely avoid lifetime-related
       complications of prepared statement objects by using the
       DB.exec() method for SQL execution.
    */
    try {
      log("5...Create a table...");
      db.exec("CREATE TABLE IF NOT EXISTS t(a,b)");
      //Equivalent:
      db.exec({
        sql:"CREATE TABLE IF NOT EXISTS t(a,b)"
        // ... numerous other options ... 
      });
      // SQL can be either a string or a byte array
      // or an array of strings which get concatenated
      // together as-is (so be sure to end each statement
      // with a semicolon).

      log("6...Insert some data using exec()...");
      log("exec() を使用してデータを挿入します。");
      let i;
      for( i = 20; i <= 25; ++i ){
        db.exec({
          sql: "insert into t(a,b) values (?,?)",
          // bind by parameter index...
          bind: [i, i*4]
        });
        db.exec({
          sql: "insert into t(a,b) values ($a,$b)",
          // bind by parameter name...
          bind: {$a: i * 10, $b: i * 20}
        });
      }    

      log("7...Insert using a prepared statement...");
      log("準備されたステートメントを使用して挿入します...");
      let q = db.prepare([
        // SQL may be a string or array of strings
        // (concatenated w/o separators).
        "insert into t(a,b) ",
        "values(?,?)"
      ]);
      try {
        for( i = 100; i < 103; ++i ){
          q.bind( [i, i*2] ).step();
          q.reset();
        }
        // Equivalent...
        for( i = 103; i <= 105; ++i ){
          q.bind(1, i).bind(2, i*2).stepReset();
        }
      }finally{
        q.finalize();
      }

      log("8...Query data with exec() using rowMode 'array'...");
      db.exec({
        sql: "select a from t order by a limit 3",
        rowMode: 'array', // 'array' (default), 'object', or 'stmt'
        callback: function(row){
          log("row ",++this.counter,"=",row);
        }.bind({counter: 0})
      });

      log("9...Query data with exec() using rowMode 'object'...");
      db.exec({
        sql: "select a as aa, b as bb from t order by aa limit 3",
        rowMode: 'object',
        callback: function(row){
          log("row ",++this.counter,"=",JSON.stringify(row));
        }.bind({counter: 0})
      });

      log("10...Query data with exec() using rowMode 'stmt'...");
      db.exec({
        sql: "select a from t order by a limit 3",
        rowMode: 'stmt',
        callback: function(row){
          log("row ",++this.counter,"get(0) =",row.get(0));
        }.bind({counter: 0})
      });

      log("11...Query data with exec() using rowMode INTEGER (result column index)...");
      db.exec({
        sql: "select a, b from t order by a limit 3",
        rowMode: 1, // === result column 1
        callback: function(row){
          log("row ",++this.counter,"b =",row);
        }.bind({counter: 0})
      });

      log("12...Query data with exec() using rowMode $COLNAME (result column name)...");
      db.exec({
        sql: "select a a, b from t order by a limit 3",
        rowMode: '$a',
        callback: function(value){
          log("row ",++this.counter,"a =",value);
        }.bind({counter: 0})
      });

      log("13...Query data with exec() without a callback...");
      let resultRows = [];
      db.exec({
        sql: "select a, b from t order by a limit 3",
        rowMode: 'object',
        resultRows: resultRows
      });
      log("14...Result rows:",JSON.stringify(resultRows,undefined,2));

      log("15...Create a scalar UDF...");
      db.createFunction({
        name: 'twice',
        xFunc: function(pCx, arg){ // note the call arg count
          return arg + arg;
        }
      });
      log("16...Run scalar UDF and collect result column names...");
      let columnNames = [];
      db.exec({
        sql: "select a, twice(a), twice(''||a) from t order by a desc limit 3",
        columnNames: columnNames,
        rowMode: 'stmt',
        callback: function(row){
          log("a =",row.get(0), "twice(a) =", row.get(1),
              "twice(''||a) =",row.get(2));
        }
      });
      log("17...Result column names:",columnNames);

      try{
        log("18...The following use of the twice() UDF will",
            "fail because of incorrect arg count...");
        db.exec("select twice(1,2,3)");
      }catch(e){
        warn("19...Got expected exception:",e.message);
      }

      try {
        db.transaction( function(D) {
          D.exec("delete from t");
          log("20...In transaction: count(*) from t =",db.selectValue("select count(*) from t"));
          throw new sqlite3.SQLite3Error("Demonstrating transaction() rollback");
        });
      }catch(e){
        if(e instanceof sqlite3.SQLite3Error){
          log("21...Got expected exception from db.transaction():",e.message);
          log("22...count(*) from t =",db.selectValue("select count(*) from t"));
        }else{
          throw e;
        }
      }

      try {
        db.savepoint( function(D) {
          D.exec("delete from t");
          log("23...In savepoint: count(*) from t =",db.selectValue("select count(*) from t"));
          D.savepoint(function(DD){
            const rows = [];
            DD.exec({
              sql: ["insert into t(a,b) values(99,100);",
                    "select count(*) from t"],
              rowMode: 0,
              resultRows: rows
            });
            log("24...In nested savepoint. Row count =",rows[0]);
            throw new sqlite3.SQLite3Error("Demonstrating nested savepoint() rollback");
          })
        });
      }catch(e){
        if(e instanceof sqlite3.SQLite3Error){
          log("25...Got expected exception from nested db.savepoint():",e.message);
          log("26...count(*) from t =",db.selectValue("select count(*) from t"));
        }else{
          throw e;
        }
      }
    }finally{
      db.close();
    }

    log("27...That's all, folks!");

 

    /**
       Some of the features of the OO API not demonstrated above...
       OO APIの機能のいくつかは上記で示されていません...

       - get change count (total or statement-local, 32- or 64-bit)
       - get a DB's file name
    
       Misc. Stmt features:

       - Various forms of bind() 
       - clearBindings()
       - reset()
       - Various forms of step()
       - Variants of get() for explicit type treatment/conversion,
         e.g. getInt(), getFloat(), getBlob(), getJSON()
       - getColumnName(ndx), getColumnNames()
       - getParamIndex(name)
    */
  }/*demo1()*/;

  log("1...Loading and initializing sqlite3 module...");
  if(self.window!==self) /*worker thread*/{
    /*
      If sqlite3.js is in a directory other than this script, in order
      to get sqlite3.js to resolve sqlite3.wasm properly, we have to
      explicitly tell it where sqlite3.js is being loaded from. We do
      that by passing the `sqlite3.dir=theDirName` URL argument to
      _this_ script. That URL argument will be seen by the JS/WASM
      loader and it will adjust the sqlite3.wasm path accordingly. If
      sqlite3.js/.wasm are in the same directory as this script then
      that's not needed.

      URL arguments passed as part of the filename via importScripts()
      are simply lost, and such scripts see the self.location of
      _this_ script.
    */
    let sqlite3Js = 'sqlite3.js';
    const urlParams = new URL(self.location.href).searchParams;
    if(urlParams.has('sqlite3.dir')){
      sqlite3Js = urlParams.get('sqlite3.dir') + '/' + sqlite3Js;
    }
    importScripts(sqlite3Js);
  }
  self.sqlite3InitModule({
    // We can redirect any stdout/stderr from the module
    // like so...
    print: log,
    printErr: error
  }).then(function(sqlite3){
    //console.log('sqlite3 =',sqlite3);
    log("2...Done initializing. Running demo...初期化完了");
    try {
      demo1(sqlite3);//実行メソッド
    }catch(e){
      error("Exception:例外エラー",e.message);
    }
  });
})();
