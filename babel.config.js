const nativewind = require("nativewind/babel");

module.exports = function (api) {
  api.cache(true);
  const nativewindConfig = nativewind();

  return {
    presets: ["babel-preset-expo"],
    plugins: [...(nativewindConfig.plugins ?? [])],
  };
};
