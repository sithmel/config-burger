var assert = require('chai').assert;
var loadRegistry = require('../lib/load-registry');
var getConfig = require('../lib/get-config');

describe('loadRegistry', function () {
  var conditions = ['_env', '_country']; // _env is more important
  var layers = [
    {
      basic: 'test',
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
    assert.deepEqual(config, { value: 1, basic: 'test' });
  });

  it('returns a simple config', function () {
    var config = getConfig(reg, {});
    assert.deepEqual(config, { value: 1, basic: 'test' });
  });

  it('returns a specific config', function () {
    var config = getConfig(reg, {_env: 'development'});
    assert.deepEqual(config, { value: 2, basic: 'test' });
  });

  it('returns a specific config (2)', function () {
    var config = getConfig(reg, {_country: 'us'});
    assert.deepEqual(config, { value: 3, desc: 'USA', basic: 'test' });
  });

  it('returns a specific config (3)', function () {
    var config = getConfig(reg, {_country: 'us', _env: 'development'});
    assert.deepEqual(config, { value: 2, desc: 'USA', basic: 'test' });
  });

  it('overrides deeply', function () {
    var layers = [
      {
        value: [1, 2]
      },
      {
        _env: 'development',
        'value[2]': 3,
        'value[0]': 'a'
      },
    ];
    var reg1 = loadRegistry(layers, ['_env']);
    var config1 = getConfig(reg1, {});
    assert.deepEqual(config1, { value: [1, 2] });
    var config2 = getConfig(reg1, {_env: 'development'});
    assert.deepEqual(config2, { value: ['a', 2, 3] });
  });

  it('uses regexp', function () {
    var layers = [
      {
        value: 1
      },
      {
        '_env::re': '(dev|prod)',
        value: 2
      },
    ];
    var reg1 = loadRegistry(layers, ['_env']);
    var config1 = getConfig(reg1, {});
    assert.deepEqual(config1, { value: 1 });
    var config2 = getConfig(reg1, {_env: 'dev'});
    assert.deepEqual(config2, { value: 2 });
  });
});
