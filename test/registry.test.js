var path = require('path')
var assert = require('chai').assert
var Registry = require('../lib/registry')

describe('Registry', function () {
  var conditions = ['_env', '_country'] // _env is more important

  var reg;

  [
    {
      describe: 'add objects',
      beforeEach: function () {
        reg = new Registry(conditions)
        reg.add({}, { basic: 'test', value: 1 })
        reg.add({ _env: 'development' }, { value: 2 })
        reg.add({ _country: 'us' }, { value: 3, desc: 'USA' })
      }
    },
    {
      describe: 'add sync and async functions',
      beforeEach: function () {
        reg = new Registry(conditions)
        reg.add({}, function () { return { basic: 'test', value: 1 } })
        reg.add({ _env: 'development' }, Promise.resolve({ value: 2 }))
        reg.add({ _country: 'us' }, function (cond, obj) {
          return Promise.resolve({ value: 3, desc: obj.country })
        })
      }
    },
    {
      describe: 'load config',
      beforeEach: function () {
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
        ]
        reg = new Registry(conditions)
        reg.loadConfig(layers)
      }
    },
    {
      describe: 'load config from file',
      beforeEach: function () {
        reg = new Registry(conditions)
        reg.loadConfigFiles(path.join(__dirname, '/test.json'))
      }
    }
  ].forEach(function (o) {
    describe(o.describe, function () {
      beforeEach(o.beforeEach)

      it('loads a registry', function () {
        assert.equal(typeof reg.registry, 'function')
        assert.equal(reg.registry.size(), 3)
      })

      it('returns a simple config for undefined args', function () {
        return reg.getConfig(undefined, { country: 'USA' })
          .then(function (config) {
            assert.deepEqual(config, { value: 1, basic: 'test' })
          })
      })

      it('returns a simple config', function () {
        return reg.getConfig({}, { country: 'USA' })
          .then(function (config) {
            assert.deepEqual(config, { value: 1, basic: 'test' })
          })
      })

      it('returns a specific config', function () {
        return reg.getConfig({ _env: 'development' }, { country: 'USA' })
          .then(function (config) {
            assert.deepEqual(config, { value: 2, basic: 'test' })
          })
      })

      it('returns a specific config (2)', function () {
        return reg.getConfig({ _country: 'us' }, { country: 'USA' })
          .then(function (config) {
            assert.deepEqual(config, { value: 3, desc: 'USA', basic: 'test' })
          })
      })

      it('returns a specific config (3)', function () {
        return reg.getConfig({ _country: 'us', _env: 'development' }, { country: 'USA' })
          .then(function (config) {
            assert.deepEqual(config, { value: 2, desc: 'USA', basic: 'test' })
          })
      })
    })
  })
})

describe('loadRegistry', function () {
  it('overrides deeply', function () {
    var layers = [
      {
        value: [1, 2]
      },
      {
        _env: 'development',
        'value[2]': 3,
        'value[0]': 'a'
      }
    ]
    var reg1 = new Registry(['_env'])
    reg1.loadConfig(layers)
    var config1 = reg1.getConfig({})
    var config2 = reg1.getConfig({ _env: 'development' })
    return Promise.all([config1, config2])
      .then(function (cfg) {
        assert.deepEqual(cfg[0], { value: [1, 2] })
        assert.deepEqual(cfg[1], { value: ['a', 2, 3] })
      })
  })

  it('uses regexp', function () {
    var layers = [
      {
        value: 1
      },
      {
        '_env::re': '(dev|prod)',
        value: 2
      }
    ]
    var reg1 = new Registry(['_env'])

    reg1.loadConfig(layers)
    var config1 = reg1.getConfig({})
    var config2 = reg1.getConfig({ _env: 'dev' })
    return Promise.all([config1, config2])
      .then(function (cfg) {
        assert.deepEqual(cfg[0], { value: 1 })
        assert.deepEqual(cfg[1], { value: 2 })
      })
  })
})

it('uses numbers', function () {
  var layers = [
    {
      value: 1
    },
    {
      _env: 10,
      value: 2
    }
  ]
  var reg1 = new Registry(['_env'])

  reg1.loadConfig(layers)
  var config1 = reg1.getConfig({})
  var config2 = reg1.getConfig({ _env: 10 })
  return Promise.all([config1, config2])
    .then(function (cfg) {
      assert.deepEqual(cfg[0], { value: 1 })
      assert.deepEqual(cfg[1], { value: 2 })
    })
})

it('uses booleans', function () {
  var layers = [
    {
      value: 1
    },
    {
      _env: false,
      value: 2
    }
  ]
  var reg1 = new Registry(['_env'])

  reg1.loadConfig(layers)
  var config1 = reg1.getConfig({})
  var config2 = reg1.getConfig({ _env: false })
  return Promise.all([config1, config2])
    .then(function (cfg) {
      assert.deepEqual(cfg[0], { value: 1 })
      assert.deepEqual(cfg[1], { value: 2 })
    })
})

it('uses null', function () {
  var layers = [
    {
      value: 1
    },
    {
      _env: null,
      value: 2
    }
  ]
  var reg1 = new Registry(['_env'])

  reg1.loadConfig(layers)
  var config1 = reg1.getConfig({})
  var config2 = reg1.getConfig({ _env: null })
  return Promise.all([config1, config2])
    .then(function (cfg) {
      assert.deepEqual(cfg[0], { value: 1 })
      assert.deepEqual(cfg[1], { value: 2 })
    })
})

describe('readme', function () {
  var reg
  beforeEach(function () {
    reg = new Registry(['vegetarian', 'hot'])
    reg.loadConfig([
      {
        bread: 'toasted bread',
        main: 'rare beef burger',
        condiment: 'mayo'
      },
      {
        vegetarian: 'yes',
        main: 'soya burger'
      },
      {
        hot: 'hot',
        condiment: 'jalapeno pepper'
      },
      {
        hot: 'very hot',
        main: 'fiery buffalo burger'
      }
    ])
  })

  it('matches the generic', function () {
    return reg.getConfig({})
      .then(function (config) {
        assert.deepEqual(config, {
          bread: 'toasted bread',
          main: 'rare beef burger',
          condiment: 'mayo'
        })
      })
  })

  it('matches the vegetarian', function () {
    return reg.getConfig({ vegetarian: 'yes' })
      .then(function (config) {
        assert.deepEqual(config, {
          bread: 'toasted bread',
          main: 'soya burger',
          condiment: 'mayo'
        })
      })
  })

  it('matches the vegetarian and hot', function () {
    return reg.getConfig({ vegetarian: 'yes', hot: 'hot' })
      .then(function (config) {
        assert.deepEqual(config, {
          bread: 'toasted bread',
          main: 'soya burger',
          condiment: 'jalapeno pepper'
        })
      })
  })

  it('matches the vegetarian and hot', function () {
    return reg.getConfig({ vegetarian: 'yes', hot: 'very hot' })
      .then(function (config) {
        assert.deepEqual(config, {
          bread: 'toasted bread',
          main: 'soya burger',
          condiment: 'mayo'
        })
      })
  })
})
