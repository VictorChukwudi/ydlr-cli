import sqlite from "sqlite3";
const db = new sqlite.Database("folder.db");
db.run(
  "CREATE TABLE IF NOT EXISTS folder(id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT)"
);

const setDir = ({ path }) => {
  //   console.info(`path ${path} set`);

  db.get(`SELECT * FROM folder `, (err, row) => {
    if (!row) {
      db.run("INSERT INTO folder (path) VALUES (?)", [`${path}`]);
      console.info(`Download path "${path}" set successfully`);
    } else if (row) {
      db.run(`UPDATE folder SET path = ? WHERE id = 1`, [`${path}`]);
      console.info(`Download path "${path}" updated successfully`);
    }
  });
  db.close();
};

const remDir = () => {
  db.run("DROP TABLE IF EXISTS folder", (err) => {
    if (err) {
      console.info("error occurred when removing custom download folder path");
    } else {
      console.info("custom download directory removed successfully");
    }
  });
};

export { db, setDir, remDir };
