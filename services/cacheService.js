//cacheServices.js
const NodeCache = require('node-cache');

// Cache instance
const cache = new NodeCache({ stdTTL: 60 }); // Cache expires after 60 seconds

module.exports = {
  set: (key, value) => cache.set(key, value),
  get: (key) => cache.get(key),
  del: (key) => cache.del(key),
  keys: () => cache.keys(),
};
