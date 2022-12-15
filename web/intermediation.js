//'use strict'; を追加することで未定義の変数の使用を禁止するなど、
//より厳格な文法でプログラムを書くことができますので、基本的にはファイルの記載することが推奨されます

'use strict';

var winObj;
var db;
var re;

function _insert(_id,_name,_price) {
  const resultRows = [];
  //const stmt = db.prepare("insert into fruits values(?, ?, ?)");
  //stmt.bind([_id, _name, _price]).stepReset();
  db.exec({
    sql: "insert into fruits(id,name,price) values ($a,$b,$c)",
    // bind by parameter name...
    bind: {$a: _id , $b: _name ,$c:_price}
  });
  
  db.exec({
    sql: "SELECT * FROM fruits",//実行するSQL
    rowMode: "object",//コールバックの最初の引数のタイプを指定します,
    //'array'(デフォルト), 'object', 'stmt'現在のStmtをコールバックに渡します
    resultRows,//returnValue:
  });
  return resultRows;
}


function _delete(id) {
  const resultRows=[];
  const stmt = db.prepare("delete from fruits where id =?");
  stmt.bind([id]).stepReset();

  //db.exec({
  //  sql: "DELETE FROM fruits WHERE id = "+ id ,
  //  rowMode: "object",
    //resultRows,
  //})

  db.exec({
    sql: "SELECT * FROM fruits",//実行するSQL
    rowMode: "object",
    resultRows,//returnValue:
  });
  return resultRows;
}

//複数のカラムを対象に並び替えを行う
//address カラムの値でソートした上で address カラムの値が同じデータに対して old カラムの値でソートします。
//ORDER BY句の後に記述する順番に気を付けて下さい。
//SELECT * FROM fruits order by address asc, old asc;

function _sort(asc){
 const resultRows=[];
 db.exec({
    sql: "SELECT * FROM fruits order by id "+asc ,//昇順でソートしてみます。
    rowMode: "object",
    resultRows,
  });
  return resultRows;
}




function jsTestFunction(msg){

    //dialogconfirm();

    //if (window.confirm("TrackBall Checkを終了します。")){
    //    open('about:blank', '_self').close();    //一度再表示してからClose 
    //};

    (async () => {
      const sqlite3 = await window.sqlite3InitModule();
    
      const { DB } = sqlite3.oo1;
      // Use :memory: storage
      const db = new DB();
    
      db.exec("CREATE TABLE IF NOT EXISTS users(id INTEGER, name TEXT)");
    
      const stmt = db.prepare("insert into users values(?, ?)");
      stmt.bind([1, "Alice"]).stepReset();
      stmt.bind([2, "Bob"]).stepReset();
      stmt.finalize();
    
      const resultRows = [];
      db.exec({
        sql: "SELECT * FROM users",
        rowMode: "object",
        resultRows,
      });
    
      // Logs { id, name }[]
      console.log(resultRows);
      return resultRows;
    })();
    
}

// JavaScript
//printOptions({responsive: true});


window.state = {
  hello: 'resultRows',
  word: 123
}



function jsInit(msg) {
  const T = self.SqliteTestUtil;
  const toss = function(...args){throw new Error(args.join(' '))};
  const debug = console.debug.bind(console);
  const eOutput = document.querySelector('#test-output');
  const logC = console.log.bind(console)
  const logE = function(domElement){
    eOutput.append(domElement);
  };
  const logHtml = function(cssClass,...args){
    const ln = document.createElement('div');
    if(cssClass) ln.classList.add(cssClass);
    ln.append(document.createTextNode(args.join(' ')));
    logE(ln);
  }
  const log = function(...args){
    logC(...args);
    logHtml('',...args);
  };
  const warn = function(...args){
    logHtml('warning',...args);
  };
  const error = function(...args){
    logHtml('error',...args);
  };



  //const sqlite3 = await window.sqlite3InitModule();

  //const { DB } = sqlite3.oo1;
  // Use :memory: storage
  //const db = new DB();


  const runTests = function(sqlite3){
    const capi = sqlite3.capi,
          oo = sqlite3.oo1,
          wasm = sqlite3.wasm;
    log("Loaded module:",capi.sqlite3_libversion(), capi.sqlite3_sourceid());
    T.assert( 0 !== capi.sqlite3_vfs_find(null) );
    if(!capi.sqlite3_vfs_find('kvvfs')){
      error("This build is not kvvfs-capable.");
      return;
    }
    
   

    const dbStorage = 0 ? 'session' : 'local';
    const theStore = 's'===dbStorage[0] ? sessionStorage : localStorage;
    const db = new oo.JsStorageDb( dbStorage );
    // Or: oo.DB(dbStorage, 'c', 'kvvfs')
    log("db.storageSize():",db.storageSize());
    




    document.querySelector('#btn-clear-log').addEventListener('click',function(){
      eOutput.innerText = '';
    });
    document.querySelector('#btn-clear-storage').addEventListener('click',function(){
      const sz = db.clearStorage();
      log("kvvfs",db.filename+"Storage cleared:",sz,"entries.");
    });
    
    document.querySelector('#btn-init-db').addEventListener('click',function(){
      try{
        
        //const saveSql = [];
        db.exec("CREATE TABLE IF NOT EXISTS fruits(id INTEGER, name TEXT, price INTEGER)");
        const stmt = db.prepare("insert into fruits values(?, ?, ?)");
        stmt.bind([1, 'apple', 150]).stepReset();
        stmt.bind([2, 'orange', 200]).stepReset();
        stmt.bind([3, 'kiwi', 350]).stepReset();
        stmt.finalize();
        

        //console.log("saveSql =",saveSql,theStore);
        log("DB (re)initialized.");
        log("DB が (再) 初期化されました。");
      }catch(e){
        error(e.message);
      }
    });
    const btnSelect = document.querySelector('#btn-sort-db-rows-order');
    btnSelect.addEventListener('click',function(){
      log("DB rows:Asc");
      const resultRows=[];
      try{
        db.exec({
          sql: "SELECT * FROM fruits order by id asc" ,//昇順でソートしてみます。
          rowMode: "object",
          resultRows,
        });
      }catch(e){
        error(e.message);
      }
      log("...sort to Asc Result rows:",JSON.stringify(resultRows,undefined,2)); 
    });

    const btnSelectAsc = document.querySelector('#btn-sort-db-rows-asc');
    btnSelectAsc.addEventListener('click',function(){
      log("DB rows:Desc");
      const resultRows=[];
      try{
        
        db.exec({
           sql: "SELECT * FROM fruits order by id desc" ,//昇順でソートしてみます。
           rowMode: "object",
           resultRows,
         });
        
      }catch(e){
        error(e.message);
      }
      log("...sort to Desc Result rows:",JSON.stringify(resultRows,undefined,2)); 
    });



    document.querySelector('#btn-storage-size').addEventListener('click',function(){
      log("size.storageSize(",dbStorage,") says", db.storageSize(),
          "bytes");
    });
    

    //db.exec("CREATE TABLE IF NOT EXISTS fruits(id INTEGER, name TEXT, price INTEGER)");

   

    const resultRows = [];
    db.exec({
      sql: "SELECT * FROM fruits",//実行するSQL
      rowMode: "object",//コールバックの最初の引数のタイプを指定します,
      //'array'(デフォルト), 'object', 'stmt'現在のStmtをコールバックに渡します
      resultRows,//returnValue:
    });
    log("ref....._insert...Result rows:", JSON.stringify(resultRows, undefined, 2));
  
    log("Storage backend:",db.filename);
    if(0===db.selectValue('select count(*) from sqlite_master')){
      log("DB is empty. Use the init button to populate it.");
      log("DB が空です。(Re)init db ボタンを使用して入力します。");
    }else{
      log("DB contains data from a previous session. Use the Clear Ctorage button to delete it.");
      log("DBには、前のセッションのデータが含まれています。[Clear storage]ボタンを使用して削除します.");
      //btnSelect.click();
    }

    

  };
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





  //log("1...Loading and initializing sqlite3 module...");
  //if(self.window!==self) /*worker thread*/{
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
  //let sqlite3Js = 'sqlite3.js';
  //const urlParams = new URL(self.location.href).searchParams;
  //if(urlParams.has('sqlite3.dir')){
  //  sqlite3Js = urlParams.get('sqlite3.dir') + '/' + sqlite3Js;
  //}
  //importScripts(sqlite3Js);
  //}




  //self.sqlite3InitModule({
  // We can redirect any stdout/stderr from the module
  // like so...
  //print: log,
  //printErr: error
  //}).then(function(sqlite3){
  //console.log('sqlite3 =',sqlite3);
  //log("2...Done initializing. Running demo...初期化完了");
  //try {
  //  runTests(sqlite3);
    //demo1(sqlite3);//実行メソッド
  //}catch(e){
  // error("Exception:例外エラー",e.message);
 
  

  //});

  sqlite3InitModule(self.sqlite3TestModule).then((sqlite3)=>{
    runTests(sqlite3);
    //demo1(sqlite3);//実行メソッド
  });


};
/*
(async () => {
  const sqlite3 = await window.sqlite3InitModule();
  console.log(sqlite3);
})();
*/

