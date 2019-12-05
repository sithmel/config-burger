var assert = require('chai').assert
var utils = require('../lib/utilities')

describe('computeScore', function () {
  it('is a function', function () {
    assert.equal(typeof utils.computeScore, 'function')
  })

  it('returns correct scores with length 2', function () {
    assert.equal(utils.computeScore(0, 2), 2)
    assert.equal(utils.computeScore(1, 2), 1)
  })

  it('returns correct scores with length 3', function () {
    assert.equal(utils.computeScore(0, 3), 4)
    assert.equal(utils.computeScore(1, 3), 2)
    assert.equal(utils.computeScore(2, 3), 1)
  })

  it('returns correct scores with length 4', function () {
    assert.equal(utils.computeScore(0, 4), 8)
    assert.equal(utils.computeScore(1, 4), 4)
    assert.equal(utils.computeScore(2, 4), 2)
    assert.equal(utils.computeScore(3, 4), 1)
  })
})

describe('promisify', function () {
  it('is a function', function () {
    assert.equal(typeof utils.promisify, 'function')
  })

  it('maps to promises', function () {
    var a = 1
    var b = Promise.resolve(2)
    return Promise.all([a, b].map(utils.promisify))
      .then(function (values) {
        assert.deepEqual(values, [1, 2])
      })
  })
})
