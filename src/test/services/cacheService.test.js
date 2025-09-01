// Test your caching system
import { describe, it, expect, beforeEach } from 'vitest';
import cacheService from '../../services/cacheService';

describe('CacheService', () => {
  beforeEach(() => {
    cacheService.clearAll();
  });

  it('stores and retrieves data correctly', () => {
    const testData = { userId: '123', name: 'Test User' };
    cacheService.set('user:123', testData);
    
    expect(cacheService.get('user:123')).toEqual(testData);
  });

  it('returns null for expired data', async () => {
    cacheService.set('temp-key', 'data', 1); // 1ms TTL
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(cacheService.get('temp-key')).toBeNull();
  });

  it('provides accurate cache statistics', () => {
    cacheService.set('key1', 'data1');
    cacheService.set('key2', 'data2');
    
    const stats = cacheService.getStats();
    expect(stats.totalEntries).toBe(2);
  });
});
