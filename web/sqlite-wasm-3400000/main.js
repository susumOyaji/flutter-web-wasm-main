'use strict';
(async () => {
  //sqlite3InitModule()を呼ぶと、jswasm/sqlite3.wasmが読み込まれて、
  //JSから操作できるようになる。
  const sqlite3 = await window.sqlite3InitModule();

  const { DB } = sqlite3.oo1;//オブジェクト指向API #1(別名oo1)
  // Use :memory: storage
  const db = new DB();

//データベースに接続
//filepath = "test2.sqlite"
//conn = sqlite3.connect(filepath) 
//filepathと同名のファイルがなければ，ファイルが作成されます

//テーブルを作成
//cur = conn.cursor()
db.exec("DROP TABLE IF EXISTS items")

db.exec("CREATE TABLE items(item_id INTEGER PRIMARY KEY,name TEXT UNIQUE,price INTEGER)")
//db.commit()




  db.exec("CREATE TABLE IF NOT EXISTS users(id INTEGER, name TEXT)");

  const stmt = db.prepare("insert into users values(?, ?)");
  stmt.bind([1, "Alice"]).stepReset();
  stmt.bind([2, "Bob"]).stepReset();
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
  //log(resultRows);
})();
//sqlite3InitModule()を呼ぶと、jswasm/sqlite3.wasmが読み込まれて、
//JSから操作できるようになる。
/*
async function asyncCall() {
  const sqlite3 = await window.sqlite3InitModule();
  console.log(sqlite3);

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
  // expected output: "resolved"
}

asyncCall();
*/