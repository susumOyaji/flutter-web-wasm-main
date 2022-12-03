'use strict';
(async () => {
  const sqlite3 = await window.sqlite3InitModule();
  console.log(sqlite3);
})();