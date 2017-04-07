function computeScore(i, len) {
  return Math.pow(2, len - i - 1);
}

function promisify(p) {
  if (typeof p === 'object' && 'then' in p) {
    return p;
  } else {
    return Promise.resolve(p);
  }
}

module.exports = {
  computeScore: computeScore,
  promisify: promisify
};
