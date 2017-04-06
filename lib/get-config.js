var template = require('lodash/set');

function getConfig(registry, args) {
  var output = {};
  var layers = overrideReg.all(args);
  layers.reverse();
  layers.forEach(function (layer) {
    if (!layer) return;
    Object.keys(layer).forEach(function (key) {
      var value = layer[key];
      set(output, key, value);
    });
  });
  return output;
}

module.exports = getConfig;
