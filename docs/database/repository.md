# Repository

Repositories provide a clean interface for database operations in BlitzBun applications.

## Creating a Repository

Generate a repository for your model:

```bash
bun run create:repository --module=users --repository=user
```

This creates `modules/users/repository/user.ts`:

```typescript
import { UserModel } from '../models/user.js';
import { BaseRepository } from '@blitzbun/core';

export class UserRepository extends BaseRepository<typeof UserModel> {
  constructor() {
    super(UserModel);
  }
}
```

## Basic Operations

### Finding Records

```typescript
// Find by ID
const user = await userRepository.find(1);

// Find by field
const user = await userRepository.findBy('email', 'john@example.com');

// Find with conditions
const users = await userRepository.findWhere({ active: true });
```

### Creating Records

```typescript
const newUser = await userRepository.create({
  name: 'John Doe',
  email: 'john@example.com',
  active: true
});
```

### Updating Records

```typescript
// Update by ID
await userRepository.update(1, { name: 'Jane Doe' });

// Update with conditions
await userRepository.updateWhere({ active: false }, { active: true });
```

### Deleting Records

```typescript
// Delete by ID
await userRepository.delete(1);

// Delete with conditions
await userRepository.deleteWhere({ active: false });
```

## Pagination

```typescript
const result = await userRepository.paginate({
  page: 1,
  limit: 10,
  where: { active: true }
});

console.log(result.data); // Array of users
console.log(result.meta); // Pagination metadata
```

## JSON Operations (PostgreSQL)

```typescript
// Find by JSON field
const users = await userRepository.findByJsonb('preferences', { theme: 'dark' });

// Update JSON field
await userRepository.updateJsonb(1, 'preferences', { theme: 'light' });
```

## Caching

Repositories include built-in caching:

```typescript
// Cache result for 1 hour
const user = await userRepository.catch('user-1', () => 
  userRepository.find(1)
, 3600);

// Clear cache
await userRepository.flush('user-1');
await userRepository.flushAll(); // Clear all cache
```

## Controller Integration

```typescript
export class UserController extends BaseController {
  private userRepository = new UserRepository();

  async index(request: HttpRequest, response: HttpResponse) {
    const users = await this.userRepository.findWhere({ active: true });
    return response.json(users);
  }

  async show(request: HttpRequest, response: HttpResponse) {
    const user = await this.userRepository.find(request.param('id'));
    return response.json(user);
  }
}
```