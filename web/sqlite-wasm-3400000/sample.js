'use strict';
(function () {
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


        log("5...Create a table...");
        db.exec("CREATE TABLE IF NOT EXISTS fruits(id INTEGER, name TEXT, price INTEGER)");

        const stmt = db.prepare("insert into fruits values(?, ?, ?)");
        stmt.bind([1, 'apple', 150]).stepReset();
        stmt.bind([2, 'orange', 200]).stepReset();
        stmt.bind([3, 'kiwi', 350]).stepReset();
        stmt.bind([4, 'cherry', 400]).stepReset();
        stmt.bind([5, 'banana', 320]).stepReset();
        stmt.bind([6, 'grape', 550]).stepReset();
        stmt.finalize();

        const resultRows = [];
        db.exec({
            sql: "SELECT * FROM fruits",
            rowMode: "object",
            resultRows,
        });

        // Logs { id, name }[]
        console.log(resultRows);
        //log(resultRows); 
        log("6...Result rows:",JSON.stringify(resultRows,undefined,2)); 

         
         
           






    }
  //const sqlite3 = await window.sqlite3InitModule();

  //const { DB } = sqlite3.oo1;
  // Use :memory: storage
  //const db = new DB();

  
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