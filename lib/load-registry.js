var or = require('occamsrazor');
var omit = require('lodash/omit');
var validator = require('occamsrazor-validator');

function computeScore(i, len) {
  return Math.pow(2, len - i);
}

function loadRegistry(list, conditions) {
  var registry = or();
  list.forEach(function (o) {
    var toOmit = [];
    var v = validator();
    conditions.forEach(function (cond, i, arr) {
      var obj = {};
      if (o[cond] || o[cond + '::re']) {
        if (o[cond + '::re']) { // it is a regexp
          toOmit.push(cond + '::re');
          obj[cond] = new RegExp(o[cond + '::re']);
        } else { // it is a string matching
          toOmit.push(cond);
          obj[cond] = o[cond];
        }
        v = v.match(obj).important(computeScore(i, arr.length));
      }
    });
    registry.add(v, omit(o, toOmit));
  });
  return registry;
}

module.exports = loadRegistry;
