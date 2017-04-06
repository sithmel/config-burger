var assert = require('chai').assert;
var loadRegistry = require('../lib/load-registry');
var getConfig = require('../lib/get-config');

describe('loadRegistry', function () {
  var conditions = ['_env', '_country']; // _env is more important
  var layers = [
    {
      value: 1
    },
    {
      _env: 'development',
      value: 2
    },
    {
      _country: 'us',
      value: 3,
      desc: 'USA'
    }
  ];
  var reg;

  beforeEach(function () {
    reg = loadRegistry(layers, conditions);
  });

  it('loads a registry', function () {
    assert.equal(typeof reg, 'function');
    assert.equal(reg.size(), 3);
  });

  it('returns a simple config for undefined args', function () {
    var config = getConfig(reg);
    assert.deepEqual(config, { value: 1 });
  });

  it('returns a simple config', function () {
    var config = getConfig(reg, {});
    assert.deepEqual(config, { value: 1 });
  });

  it('returns a specific config', function () {
    var config = getConfig(reg, {_env: 'development'});
    assert.deepEqual(config, { value: 2 });
  });

  it('returns a specific config (2)', function () {
    var config = getConfig(reg, {_country: 'us'});
    assert.deepEqual(config, { value: 3, desc: 'USA' });
  });

  it('returns a specific config (3)', function () {
    var config = getConfig(reg, {_country: 'us', _env: 'development'});
    assert.deepEqual(config, { value: 2, desc: 'USA' });
  });
});
// deep override test
// regexp/strings
