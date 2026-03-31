let memoryFallbackEnabled = false;

export function enableMemoryFallback() {
  memoryFallbackEnabled = true;
}

export function disableMemoryFallback() {
  memoryFallbackEnabled = false;
}

export function isMemoryFallbackEnabled() {
  return memoryFallbackEnabled;
}
