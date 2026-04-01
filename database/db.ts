import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
  if (Platform.OS === "web") {
    // SQLite web worker is unstable. Falling back to Memory Store.
    throw new Error("SQLite is not supported on Web. Use Memory Store instead.");
  }

  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("unika_shop.db");
    await dbInstance.execAsync("PRAGMA foreign_keys = ON;");
  }
  return dbInstance;
}
