import { Platform } from "react-native";

let memoryFallbackEnabled = Platform.OS === "web";

export function enableMemoryFallback() {
  memoryFallbackEnabled = true;
}

export function disableMemoryFallback() {
  memoryFallbackEnabled = false;
}

export function isMemoryFallbackEnabled() {
  return memoryFallbackEnabled;
}
