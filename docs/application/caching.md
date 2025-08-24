# Caching

BlitzBun provides a comprehensive caching system that supports multiple storage drivers (Memory, Redis) with advanced features like tagged caching for complex invalidation scenarios.

## System Overview

The caching system consists of several key components:

- **Cache Manager**: Central manager for creating and managing cache store instances
- **Cache Stores**: Driver implementations (Memory, Redis) that handle actual data storage
- **Tagged Cache**: Advanced caching with tag-based invalidation for complex data relationships
- **Repository Integration**: Built-in caching patterns for database operations

## Architecture

```
CacheManager
├── MemoryStore (with TaggedMemoryStore)
├── RedisStore (with TaggedRedisStore)
└── Store Configuration Management
```

## Configuration

Cache configuration is defined in `/packages/framework/src/configs/cache.ts`:

```typescript
export default (envService: EnvContract) => ({
  default: 'memory',
  stores: {
    redis_cache: {
      db: 1,
      prefix: 'cache-store:',
      host: envService.get('REDIS_HOST'),
      port: envService.get('REDIS_PORT'),
      password: envService.get('REDIS_PASSWORD'),
    },
    redis_queue: {
      db: 0,
      host: envService.get('REDIS_HOST'),
      port: envService.get('REDIS_PORT'),
      password: envService.get('REDIS_PASSWORD'),
    },
    redis_session: {
      db: 2,
      prefix: 'session-store:',
      host: envService.get('REDIS_HOST'),
      port: envService.get('REDIS_PORT'),
      password: envService.get('REDIS_PASSWORD'),
    },
  },
});
```

### Environment Variables

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

## Usage Examples

### Basic Cache Operations

```typescript
// Get cache manager
const cache = app.get('cache');

// Use default store
const defaultStore = cache.store();
await defaultStore.put('user:123', userData, 300); // 5 minutes TTL
const user = await defaultStore.get('user:123');

// Use specific store
const redisStore = cache.store('redis_cache');
await redisStore.put('session:abc', sessionData);
const session = await redisStore.get('session:abc');
```

### Tagged Caching

```typescript
const cache = app.get('cache');
const store = cache.store('redis_cache');

// Tag cache entries
const taggedCache = store.tags('users', 'profiles');
await taggedCache.put('user:123', userData);
await taggedCache.put('profile:123', profileData);

// Invalidate all entries with specific tags
await taggedCache.flush(); // Removes all 'users' and 'profiles' tagged entries
```

### Repository Caching Example

```typescript
class UserRepository extends BaseRepository {
  async findByEmail(email: string) {
    return await this.catch(
      `user:email:${email}`,
      async () => {
        return await this.db
          .select()
          .from(this.table)
          .where(eq(this.table.email, email));
      },
      300 // 5 minutes TTL
    );
  }

  async updateUser(id: string, data: any) {
    const result = await this.db
      .update(this.table)
      .set(data)
      .where(eq(this.table.id, id));

    // Invalidate cache for this user
    await this.flushAll();

    return result;
  }
}
```

## Best Practices

1. **Choose the Right Store**: Use memory for single-instance apps, Redis for distributed systems
2. **Use TTL Appropriately**: Set reasonable expiration times to prevent stale data
3. **Tag Related Data**: Group related cache entries with tags for efficient invalidation
4. **Repository Pattern**: Leverage built-in repository caching for database operations
5. **Health Monitoring**: Include cache health checks in your application monitoring
6. **Error Handling**: Always handle cache failures gracefully with fallback to data source
7. **Key Naming**: Use consistent, descriptive key naming conventions
8. **Memory Management**: Monitor memory usage, especially with the memory store

## Available Cache Clients

- `memory`: In-memory storage for single instance applications
- `redis_cache`: Redis storage for general caching
- `redis_queue`: Redis storage for queue operations
- `redis_session`: Redis storage for session data

Each Redis client can use different database indexes and prefixes for data isolation.
