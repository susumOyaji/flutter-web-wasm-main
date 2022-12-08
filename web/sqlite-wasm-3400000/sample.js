'use strict';

var db;

function _insert(id,name,price) {
  const stmt = db.prepare("insert into fruits values(?, ?, ?)");
  stmt.bind([id, name, price]).stepReset();

  const resultRows = [];
  db.exec({
    sql: "SELECT * FROM fruits",//実行するSQL
    rowMode: "object",//コールバックの最初の引数のタイプを指定します,
    //'array'(デフォルト), 'object', 'stmt'現在のStmtをコールバックに渡します
    resultRows,//returnValue:
  });
  log("_insert...Result rows:", JSON.stringify(resultRows, undefined, 2)); 

}

function _delete(id) {
  const stmt = db.prepare("delete into fruits values(?, ?, ?)");
  
}


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
        db = new oo.DB("/mydb.sqlite3",'ct');
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
          sql: "SELECT * FROM fruits",//実行するSQL
          rowMode: "object",//コールバックの最初の引数のタイプを指定します,
          //'array'(デフォルト), 'object', 'stmt'現在のStmtをコールバックに渡します
          resultRows,//returnValue:
        });
      
     
      _insert(9,'lemon',1000);
      /*  
      exec()
        指定された文字列内のすべての SQL ステートメントを実行します。 引数は次のいずれかである必要があります。
        
        (sql, optionsObject)又は(optionsObject)
        後者の場合、SQLを含める必要があります 実行します。デフォルトではこのオブジェクトを返しますが、
        これは、以下で説明するオプション。それ エラーをスローします。optionsObject.sqlreturnValue
        
        SQL が指定されていない場合、または文字列以外の値が指定されている場合は、 例外がトリガーされます。
        一方、空のSQLは 単にノーオペ。
        オプションの options オブジェクトには、次のいずれかを含めることができます。 プロパティ：
        
        sql:実行するSQL(提供されていない場合) 最初の引数として)。
        
        bind:Stmt.bind() の引数として有効な単一の値。
        これは、バインド可能なSQLの最初の空でないステートメントにのみ適用されます パラメーター。
        (空のステートメントは完全にスキップされます。
        
        saveSql: オプションの配列。設定されている場合、実行されるそれぞれのSQLは ステートメントは、ステートメントが実行される前にこの配列に追加されます (しかし、それが準備された後-私たちは後まで文字列を持っていません それ)。空の SQL ステートメントは省略されます。
        
        戻り値:この関数の内容を指定する文字列です 戻る必要があります:
        
        デフォルト値は、DBオブジェクト自体が )を返す必要があります。"this"
        "resultRows"の値を返すことを意味しますオプション。が設定されていない場合、この関数は次のように動作します 空の配列に設定されました。resultRowsresultRows
        "saveSql"の値を返すことを意味しますオプション。が設定されていない場合、この関数は次のように動作します。 空の配列。saveSqlsaveSql
        次のオプションは、最初のステートメントにのみ適用されます。 結果列数がゼロ以外の場合、 このステートメントは、実際には結果行を生成します。
        
        コールバック:の各行に対して呼び出される関数 結果セット(下記参照)ですが、そのステートメントに 結果行。コールバックはオプションオブジェクトです。 この関数は、次の目的でそのようなオブジェクトを合成する可能性があることに注意してください。 オプションを正規化します (クライアントが渡したオブジェクトではない可能性があります で)。コールバックに渡される 2 番目の引数は、常に 現在のStmtオブジェクト、呼び出し元がフェッチしたい場合に必要 列名など(フェッチすることもできることに注意してください) 経由、クライアントがオプションを提供する場合)。
        ACHTUNG: コールバックは Stmt オブジェクトを変更してはなりません。天職 バリアントのいずれか、、または 同様に、合法ですが、カリンゴリス じゃない。このコンテキストで無効なメンバーメソッドがトリガーされます 例外です。rowModethisthis.columnNamescolumnNamesStmt.get()Stmt.getColumnName()step()finalize()
        
        columnNames: これが配列の場合、結果の列名 set は、コールバック (存在する場合) の前にこの配列に格納されます トリガー (クエリが結果を生成するかどうかに関係なく) 行)。結果列を持つステートメントがない場合、この値は 変更。Achtung:SQLの結果には、 同じ名前。
        
        resultRows:これが配列の場合、オプション:結果セットの各行(存在する場合)、 「STMT」が合法ではないという例外。使用することは合法です ボットハンド、しかし可能性が高いです 小さなデータセットに使いやすく、 WebWorkerスタイルのメッセージインターフェイスは、ifisが設定され、 'stmt'をスローします。callbackrowModeresultRowscallbackresultRowsexec()resultRowsrowMode
        
        コールバックに渡される最初の引数は、デフォルトで次の配列になります。 現在の結果行の値ですが、次のように変更できます。
        
        rowMode: コールバックの最初の引数のタイプを指定します。 それは次のいずれかかもしれません...
        
        渡す引数の種類を記述する文字列 コールバックの最初の引数として:
        'array'(デフォルト) は、次の結果を引き起こします。 に渡されるおよび/または追加される。stmt.get([])callbackresultRows
        'object'の結果がに渡されますおよび/または追加されます。 Achtung:SQLの結果には、同一の複数の列が含まれる場合があります 名。その場合、右端の列が1セットになります このオブジェクトで!stmt.get(Object.create(null))callbackresultRows
        'stmt'現在のStmtをコールバックに渡します。 しかし、このモードは、次の場合に例外をトリガーします 配列にステートメントを追加すると、 まったく役に立たない。resultRows
        結果の 0 から始まる列を示す整数 漕ぐ。その単一の値のみが渡されます。
        最小長が 2 で先頭文字が ':' の文字列。 '$'、または '@'は行をオブジェクトとしてフェッチし、その1つのフィールドを抽出し、 そのフィールドの値をコールバックに渡します。これらのキーに注意してください は大文字と小文字が区別されるため、 .SQL。例えば、アオフウィルと 動作しますが、しません。結果にない列への参照 set は最初の行で例外をトリガします (チェックは 行がフェッチされるまで実行されます)。また、それは合法です JSの識別子文字なので、引用符で囲む必要はありません。
        (デザインノート:これらの3つのキャラクターは、 文字はバインドされたパラメーターの名前付けをサポートします)。"select a A from t"rowMode'$A''$a'$
        その他の値を指定すると、例外がトリガーされます。rowMode
        */
        
        
      
      
      
      
      

        // Logs { id, name }[]
        console.log(resultRows);
        //log(resultRows); 
      log("6...Result rows:", JSON.stringify(resultRows, undefined, 2)); 
      
     
        db.exec({
          sql: "SELECT * FROM fruits order by name asc",//昇順でソートしてみます。
          rowMode: "object",
          resultRows,
        });
        log("7...Result rows:", JSON.stringify(resultRows, undefined, 2)); 
      
        db.exec({
          sql: "SELECT * FROM fruits order by name desc",//降順でソートしてみます。
          rowMode: "object",
          resultRows,
        });
        log("8...Result rows:",JSON.stringify(resultRows,undefined,20)); 
         
     


        //複数のカラムを対象に並び替えを行う
        //address カラムの値でソートした上で address カラムの値が同じデータに対して old カラムの値でソートします。
        //ORDER BY句の後に記述する順番に気を付けて下さい。
        //SELECT * FROM fruits order by address asc, old asc;




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


}

)();

