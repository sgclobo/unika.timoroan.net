const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Expo SQLite web worker imports a .wasm file that must be treated as an asset.
if (!config.resolver.assetExts.includes("wasm")) {
  config.resolver.assetExts.push("wasm");
}

config.resolver.sourceExts = config.resolver.sourceExts.filter(
  (ext) => ext !== "wasm",
);

module.exports = config;
