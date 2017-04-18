var fs = require('fs');
var or = require('occamsrazor');
var validator = require('occamsrazor-validator');
var omit = require('lodash/omit');
var pick = require('lodash/pick');
var set = require('lodash/set');
var cloneDeep = require('lodash/cloneDeep');
var utils = require('./utilities');

function Registry(conditions, reg) {
  this.registry = reg || or();
  this.conditions = conditions;
  this.conditionNames = this.conditions.concat(this.conditions.map(function (c) {return c + '::re'}));
}

Registry.prototype.add = function (parameters, func) {
  var v = validator();
  this.conditions.forEach(function (cond, i, arr) {
    var obj = {};
    if (parameters[cond] || parameters[cond + '::re']) {
      if (parameters[cond + '::re']) { // it is a regexp
        obj[cond] = new RegExp(parameters[cond + '::re']);
      } else { // it is a string matching
        obj[cond] = parameters[cond];
      }
      v = v.match(obj).important(utils.computeScore(i, arr.length));
    }
  });
  this.registry.add(v, func);
};

Registry.prototype.loadConfig = function (obj) {
  var self = this;
  // input object or array
  obj = Array.isArray(obj) ? obj : [obj];
  obj.forEach(function (o) {
    self.add(pick(o, self.conditionNames), omit(o, self.conditionNames));
  });
};

Registry.prototype.loadConfigFiles = function (files) { // input filename, or filenames
  files = Array.isArray(files) ? files : [files];
  files
  .map(function (fname) {
    return fs.readFileSync(fname, 'utf8');
  })
  .map(function (content) {
    return JSON.parse(content);
  })
  .forEach(this.loadConfig.bind(this));
};

Registry.prototype.getConfig = function (par, init) { // parameters
  var layers = cloneDeep(this.registry.all(par));
  layers.reverse();

  return Promise.all(layers.map(utils.promisify))
  .then(function (layers) {
    var output = init ? cloneDeep(init) : {};
    layers.forEach(function (layer) {
      if (!layer) return;
      Object.keys(layer).forEach(function (key) {
        var value = layer[key];
        set(output, key, value);
      });
    });
    return output;
  });
}; // return promise

module.exports = Registry;
