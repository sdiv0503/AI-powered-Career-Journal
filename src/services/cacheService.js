// Intelligent caching for Firebase data
class CacheService {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  }

  // Set cached data
  set(key, data, ttl = this.DEFAULT_TTL) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now() + ttl);
  }

  // Get cached data
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const timestamp = this.timestamps.get(key);
    if (Date.now() > timestamp) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  // Check if data exists and is valid
  has(key) {
    return this.get(key) !== null;
  }

  // Clear specific cached data
  clear(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  // Clear all cached data
  clearAll() {
    this.cache.clear();
    this.timestamps.clear();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, timestamp] of this.timestamps) {
      if (now <= timestamp) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: this.hitRate || 0
    };
  }
}

export default new CacheService();
