# Transformers

BlitzBun transformers provide a powerful way to format and serialize data before sending it to the client. They allow you to control exactly how your models and data structures are presented in API responses, with support for selective field inclusion, data relationships, and consistent formatting.

## What is a BlitzBun Transformer?

A transformer is a class that extends `BaseTransformer` and defines how your database models or data objects should be converted into API response format. Transformers serve several purposes:

- **Data Formatting**: Convert raw database records into clean, consistent API responses
- **Field Selection**: Control which fields are exposed in API responses
- **Relationship Loading**: Handle related data inclusion based on query parameters
- **Data Transformation**: Apply formatting, calculations, or modifications to data before output

## Creating a Transformer

Use the built-in command to generate a new transformer:

```bash
bun blitz create:transformer --module=users --transformer=user
```

This creates a transformer file at `modules/users/transformers/user.ts`:

```typescript
import { BaseTransformer } from '@blitzbun/core';
import { UserModel } from '../models/user';

export default class UserTransformer extends BaseTransformer<UserModel, Partial<UserModel>> {
  async toArray(model: UserModel): Promise<Partial<UserModel>> {
    return {
      uuid: model.uuid,
      name: model.name,
      email: model.email,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
```

## Core Methods

### `toArray(model: T): Promise<R>`

The main transformation method that defines how a single model should be converted. This method is abstract and must be implemented in your transformer.

```typescript
async toArray(model: UserModel): Promise<Partial<UserModel>> {
  return {
    uuid: model.uuid,
    name: model.name,
    email: model.email,
    role: model.role,
    // Transform dates to ISO strings
    createdAt: model.createdAt.toISOString(),
    // Calculate derived fields
    isActive: model.lastLoginAt && model.lastLoginAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  };
}
```

### `transform(model: T): Promise<R>`

Transforms a single model instance and handles relationship inclusion based on query parameters.

```typescript
// In a controller
const user = await userRepository.findById(1);
const transformer = new UserTransformer(request);
const transformedUser = await transformer.transform(user);
```

### `collection(input: T[] | PaginatedData<T>): Promise<R[] | PaginatedData<R>>`

Transforms arrays of models or paginated data structures:

```typescript
// Transform array of models
const users = await userRepository.findMany();
const transformer = new UserTransformer(request);
const transformedUsers = await transformer.collection(users);

// Transform paginated data
const paginatedUsers = await userRepository.paginate({ page: 1, limit: 10 });
const transformedPaginated = await transformer.collection(paginatedUsers);
```

## Relationship Inclusion

Transformers support dynamic relationship inclusion through query parameters and include methods.

### Query Parameter Support

Add `?include=profile,posts` to your request URL to include relationships:

```typescript
export default class UserTransformer extends BaseTransformer<UserModel, Partial<UserModel>> {
  async toArray(model: UserModel): Promise<Partial<UserModel>> {
    return {
      uuid: model.uuid,
      name: model.name,
      email: model.email,
    };
  }

  // Include methods are called automatically based on ?include parameter
  async includeProfile(model: UserModel, request: HttpRequestContract) {
    if (model.profile) {
      const profileTransformer = new ProfileTransformer(request);
      return await profileTransformer.transform(model.profile);
    }
    return null;
  }

  async includePosts(model: UserModel, request: HttpRequestContract) {
    if (model.posts) {
      const postTransformer = new PostTransformer(request);
      return await postTransformer.collection(model.posts);
    }
    return [];
  }
}
```

### Include Method Naming

Include methods follow the pattern `include{RelationshipName}`:
- `?include=profile` ’ calls `includeProfile()`
- `?include=user_posts` ’ calls `includeUserPosts()`
- `?include=billing_address` ’ calls `includeBillingAddress()`

## Usage in Controllers

### Basic Usage

```typescript
import { UserTransformer } from '../transformers/user';

export default class UserController {
  index = async (req: HttpRequestContract, res: HttpResponseContract) => {
    const users = await this.userRepository.findMany();
    const transformer = new UserTransformer(req);
    const transformedUsers = await transformer.collection(users);
    
    return res.json(transformedUsers);
  };

  show = async (req: HttpRequestContract, res: HttpResponseContract) => {
    const user = await this.userRepository.findById(req.params.id);
    const transformer = new UserTransformer(req);
    const transformedUser = await transformer.transform(user);
    
    return res.json(transformedUser);
  };
}
```

### With Pagination

```typescript
index = async (req: HttpRequestContract, res: HttpResponseContract) => {
  const page = req.query('page', 1);
  const limit = req.query('limit', 10);
  
  const paginatedUsers = await this.userRepository.paginate({ page, limit });
  const transformer = new UserTransformer(req);
  const result = await transformer.collection(paginatedUsers);
  
  return res.json(result);
  // Returns: { data: [...], meta: { total, perPage, totalPages, currentPage } }
};
```

## Advanced Patterns

### Conditional Field Inclusion

```typescript
async toArray(model: UserModel): Promise<Partial<UserModel>> {
  const base = {
    uuid: model.uuid,
    name: model.name,
    email: model.email,
  };

  // Include sensitive fields only for authenticated user
  if (this.request.user?.uuid === model.uuid) {
    return {
      ...base,
      phoneNumber: model.phoneNumber,
      emailVerifiedAt: model.emailVerifiedAt,
    };
  }

  return base;
}
```

### Nested Transformations

```typescript
async includeCompany(model: UserModel, request: HttpRequestContract) {
  if (model.company) {
    const companyTransformer = new CompanyTransformer(request, ['employees', 'projects']);
    return await companyTransformer.transform(model.company);
  }
  return null;
}
```

### Data Calculations

```typescript
async toArray(model: OrderModel): Promise<Partial<OrderModel>> {
  return {
    uuid: model.uuid,
    items: model.items,
    // Calculate totals
    subtotal: model.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    tax: model.taxAmount,
    total: model.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + model.taxAmount,
    // Format dates
    createdAt: model.createdAt.toISOString(),
    // Add computed fields
    status: this.calculateOrderStatus(model),
  };
}

private calculateOrderStatus(order: OrderModel): string {
  if (order.shippedAt) return 'shipped';
  if (order.paidAt) return 'paid';
  return 'pending';
}
```

## Type Safety

Transformers are fully typed with TypeScript generics:

```typescript
// T = Input model type, R = Output response type
export default class UserTransformer extends BaseTransformer<UserModel, UserResponse> {
  async toArray(model: UserModel): Promise<UserResponse> {
    // TypeScript enforces return type matches UserResponse
    return {
      uuid: model.uuid,
      name: model.name,
      email: model.email,
      createdAt: model.createdAt.toISOString(),
    };
  }
}

interface UserResponse {
  uuid: string;
  name: string;
  email: string;
  createdAt: string;
}
```

## Best Practices

1. **Keep transformers focused**: Each transformer should handle a single model type
2. **Use consistent field naming**: Follow your API naming conventions
3. **Handle null/undefined data**: Always check for data existence before transforming
4. **Optimize includes**: Only load related data when specifically requested
5. **Type your outputs**: Define interfaces for your response structures
6. **Avoid heavy computation**: Keep transformation logic lightweight
7. **Cache when appropriate**: For expensive calculations or external API calls

## Error Handling

Transformers include built-in validation through the `isValid()` method:

```typescript
protected isValid(model: Partial<T>): model is T {
  return Boolean(model && ('uuid' in model || 'id' in model));
}
```

Invalid models are automatically filtered out during collection transformation, ensuring your API never returns incomplete or corrupted data.