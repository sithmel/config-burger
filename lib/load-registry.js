var or = require('occamsrazor');
var omit = require('lodash/omit');
var validator = require('occamsrazor-validator');

function computeScore(i, len) {
  return Math.pow(2, len - i);
}

function loadRegistry(list, conditions) {
  var registry = or();
  list.forEach(function (o) {
    var v = validator();
    conditions.forEach(function (cond, i, arr) {
      var obj = {};
      if (o[cond]) {
        obj[cond] = new RegExp(o[cond]); // is regexp or string ?
        v = v.match(obj).important(computeScore(i, arr.length));
      }
    });
    registry.add(v, omit(o, conditions));
  });
  return registry;
}
module.exports = loadRegistry;
