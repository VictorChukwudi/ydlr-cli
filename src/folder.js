import ora from "ora";

import Database from "better-sqlite3";
const db = new Database("folder.db");

db.prepare(
  "CREATE TABLE IF NOT EXISTS folder(id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT)"
).run();
const spinner = ora();

const setDir = ({ path }) => {
  const stmt = db.prepare(`SELECT * FROM folder `);
  const res = stmt.get();
  if (!res) {
    db.prepare("INSERT INTO folder (path) VALUES (?)").run(`${path}`);

    spinner.succeed(`Download path "${path}" set successfully`);
  } else {
    db.prepare("UPDATE folder SET path = ? WHERE id = 1").run(`${path}`);

    spinner.succeed(`Download path "${path}" updated successfully`);
  }
  db.close();
};

const remDir = () => {
  const stmt = db.prepare("DROP TABLE IF EXISTS folder");
  const res = stmt.run();
  if (!res) {
    spinner.fail("error occurred when removing custom download folder path");
  } else {
    spinner.succeed("custom download directory removed successfully");
  }
};

export { db, setDir, remDir };
