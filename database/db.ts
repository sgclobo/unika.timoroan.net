import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("unika_shop.db");
    await dbInstance.execAsync("PRAGMA foreign_keys = ON;");
  }
  return dbInstance;
}
