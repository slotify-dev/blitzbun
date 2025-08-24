# Routing

Routing is the system that determines how your BlitzBun application responds to different HTTP requests. Think of routes as a map that tells your application "when someone visits this URL with this method, do this specific action."

## What is Routing?

Routing connects URLs to your application code. When someone visits `https://yourapp.com/users/123`, the routing system finds the right piece of code to handle that request and extract useful information (like the user ID `123`).

It's like having a receptionist who knows exactly which department to send visitors to based on what they're asking for.

## Purpose

The routing system provides:

- **URL Pattern Matching**: Define patterns that match multiple similar URLs
- **HTTP Method Support**: Handle GET, POST, PUT, DELETE, PATCH requests differently
- **Parameter Extraction**: Automatically extract values from URLs
- **Route Groups**: Organize related routes with shared configuration
- **Middleware Integration**: Apply processing logic to specific routes
- **Pattern Flexibility**: Support complex URL patterns and constraints

## What's Included

The routing system includes:

### Route Registration

- **HTTP method routing** (GET, POST, PUT, DELETE, PATCH)
- **Parameter binding** with automatic type conversion
- **Wildcard patterns** for flexible URL matching
- **Optional parameters** for versatile route definitions

### Route Organization

- **Route groups** with shared prefixes and middleware
- **Nested groups** for complex application structures
- **Module-based routing** for scalable applications
- **Route caching** for improved performance

### Route Matching

- **Efficient pattern matching** using compiled regular expressions
- **Parameter extraction** with named capture groups
- **Trailing slash handling** for user-friendly URLs
- **Route priority** resolution for overlapping patterns

## Basic Routing

### Simple Routes

```typescript
import { Application } from '@blitzbun/core';

const app = new Application(__dirname);
const router = app.get('router');

// GET route - retrieve data
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to BlitzBun!' });
});

// POST route - create data
router.post('/users', (req, res) => {
  const userData = req.getBody();
  res.json({ success: true, user: userData });
});

// PUT route - update data
router.put('/users/:id', (req, res) => {
  const userId = req.param('id');
  const userData = req.getBody();
  res.json({ success: true, userId, userData });
});

// DELETE route - remove data
router.delete('/users/:id', (req, res) => {
  const userId = req.param('id');
  res.json({ success: true, message: `User ${userId} deleted` });
});

// PATCH route - partial update
router.patch('/users/:id', (req, res) => {
  const userId = req.param('id');
  const updates = req.getBody();
  res.json({ success: true, userId, updates });
});
```

### Route Parameters

Route parameters are parts of the URL that can change. They're defined with a colon (`:`) followed by the parameter name.

```typescript
// Single parameter
router.get('/users/:id', (req, res) => {
  const userId = req.param('id');
  res.json({ message: `User ID is ${userId}` });
});

// Multiple parameters
router.get('/users/:userId/posts/:postId', (req, res) => {
  const userId = req.param('userId');
  const postId = req.param('postId');
  res.json({
    message: `Post ${postId} by User ${userId}`,
  });
});

// Optional parameters (using ? at the end)
router.get('/posts/:id/:slug?', (req, res) => {
  const postId = req.param('id');
  const slug = req.param('slug', 'default-slug');
  res.json({ postId, slug });
});

// Wildcard parameters (catch-all)
router.get('/files/*', (req, res) => {
  const filePath = req.param('*');
  res.json({
    message: `Requested file: ${filePath}`,
  });
});
```

### Parameter Patterns and Constraints

```typescript
// Numeric ID constraint (digits only)
router.get('/users/:id(\\d+)', (req, res) => {
  const userId = parseInt(req.param('id'));
  res.json({ userId, type: 'number' });
});

// String pattern constraint
router.get('/categories/:category([a-z]+)', (req, res) => {
  const category = req.param('category');
  res.json({ category, message: 'Valid category' });
});

// Multiple pattern constraints
router.get('/api/:version(v\\d+)/:resource([a-z]+)/:id(\\d+)', (req, res) => {
  const version = req.param('version');
  const resource = req.param('resource');
  const id = req.param('id');

  res.json({ version, resource, id });
});
```

## Route Groups

Route groups allow you to organize related routes and apply common configuration to them.

### Basic Groups

```typescript
// Group with prefix
router.group({ prefix: '/api' }, () => {
  router.get('/users', (req, res) => {
    // Responds to: GET /api/users
    res.json({ users: [] });
  });

  router.post('/users', (req, res) => {
    // Responds to: POST /api/users
    res.json({ success: true });
  });
});

// Nested groups
router.group({ prefix: '/api' }, () => {
  router.group({ prefix: '/v1' }, () => {
    router.get('/users', (req, res) => {
      // Responds to: GET /api/v1/users
      res.json({ version: 'v1', users: [] });
    });
  });

  router.group({ prefix: '/v2' }, () => {
    router.get('/users', (req, res) => {
      // Responds to: GET /api/v2/users
      res.json({ version: 'v2', users: [] });
    });
  });
});
```

### Groups with Middleware

```typescript
// Authentication middleware
const authMiddleware = async (req, res, next) => {
  const token = req.bearerToken();
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await verifyToken(token);
    req.setUser(user);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin middleware
const adminMiddleware = async (req, res, next) => {
  const user = req.getUser();
  if (!user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Apply middleware to groups
router.group(
  {
    prefix: '/api',
    middleware: [authMiddleware],
  },
  () => {
    // All routes in this group require authentication
    router.get('/profile', (req, res) => {
      const user = req.getUser();
      res.json({ user });
    });

    router.put('/profile', (req, res) => {
      const user = req.getUser();
      const updates = req.getBody();
      res.json({ success: true, user, updates });
    });

    // Admin-only routes
    router.group(
      {
        prefix: '/admin',
        middleware: [adminMiddleware],
      },
      () => {
        router.get('/users', (req, res) => {
          // Requires both auth and admin middleware
          res.json({ users: [] });
        });

        router.delete('/users/:id', (req, res) => {
          const userId = req.param('id');
          res.json({ success: true, deletedUserId: userId });
        });
      }
    );
  }
);
```

## Advanced Routing Patterns

### Resource Routes

Create RESTful resource routes quickly:

```typescript
// Manual resource routes
const createResourceRoutes = (resource: string, controller: any) => {
  const prefix = `/${resource}`;

  router.get(prefix, controller.index); // GET /users
  router.post(prefix, controller.store); // POST /users
  router.get(`${prefix}/:id`, controller.show); // GET /users/:id
  router.put(`${prefix}/:id`, controller.update); // PUT /users/:id
  router.delete(`${prefix}/:id`, controller.destroy); // DELETE /users/:id
};

// Usage
createResourceRoutes('users', userController);
createResourceRoutes('posts', postController);
```

### Conditional Routing

Routes that respond differently based on conditions:

```typescript
// API versioning through headers
router.get('/users', (req, res) => {
  const apiVersion = req.getHeader('api-version', 'v1');

  switch (apiVersion) {
    case 'v1':
      res.json({
        version: 'v1',
        users: await userService.getAllUsers(),
      });
      break;

    case 'v2':
      res.json({
        version: 'v2',
        data: await userService.getAllUsersWithMetadata(),
      });
      break;

    default:
      res.status(400).json({
        error: 'Unsupported API version',
      });
  }
});

// Content negotiation
router.get('/users/:id', (req, res) => {
  const user = await userService.findById(req.param('id'));

  if (req.isJson()) {
    res.json({ user });
  } else {
    // Render HTML template
    res.html(renderTemplate('user-profile', { user }));
  }
});
```

## Route Organization Patterns

### Controller-Based Organization

```typescript
// controllers/user-controller.ts
export class UserController {
  constructor(private app: Application) {}

  async index(req, res) {
    const userService = this.app.get('userService');
    const users = await userService.getAllUsers();
    res.json({ users });
  }

  async show(req, res) {
    const userId = req.param('id');
    const userService = this.app.get('userService');
    const user = await userService.findById(userId);
    res.json({ user });
  }

  async store(req, res) {
    const userData = req.getBody();
    const userService = this.app.get('userService');
    const user = await userService.create(userData);
    res.status(201).json({ user });
  }
}

// Register controller routes
const userController = new UserController(app);

router.group({ prefix: '/users' }, () => {
  router.get('/', userController.index.bind(userController));
  router.post('/', userController.store.bind(userController));
  router.get('/:id', userController.show.bind(userController));
});
```

### Module-Based Organization

```typescript
// routes/user-routes.ts
export const registerUserRoutes = (router: HttpRouter) => {
  router.group({ prefix: '/users' }, () => {
    router.get('/', userController.index);
    router.post('/', userController.store);
    router.get('/:id', userController.show);
    router.put('/:id', userController.update);
    router.delete('/:id', userController.destroy);
  });
};

// routes/post-routes.ts
export const registerPostRoutes = (router: HttpRouter) => {
  router.group({ prefix: '/posts' }, () => {
    router.get('/', postController.index);
    router.post('/', postController.store);
    router.get('/:id', postController.show);
  });
};

// main route file
import { registerUserRoutes } from './routes/user-routes';
import { registerPostRoutes } from './routes/post-routes';

registerUserRoutes(router);
registerPostRoutes(router);
```

## Best Practices

1. **Use Route Groups**: Organize related routes with groups
2. **Parameter Constraints**: Use regex patterns to validate parameters
3. **Consistent Naming**: Follow RESTful conventions for route naming
4. **Middleware Order**: Apply middleware in the correct order (auth before permissions)
5. **Error Handling**: Always handle errors gracefully in route handlers
6. **Documentation**: Document complex routes and their parameters
7. **Testing**: Write tests for all route patterns and edge cases

## Common Patterns

### REST API Routes

```typescript
// GET    /api/users      - List all users
// POST   /api/users      - Create new user
// GET    /api/users/:id  - Get specific user
// PUT    /api/users/:id  - Update specific user
// DELETE /api/users/:id  - Delete specific user
```

### Nested Resources

```typescript
// GET    /api/users/:userId/posts - Get user's posts
// POST   /api/users/:userId/posts - Create post for user
```

### Versioned APIs

```typescript
// /api/v1/users
// /api/v2/users
```

## Next Steps

Now that you understand routing, explore these related concepts:

- [🎮 Controllers](./controllers.md) - Organize your route handlers
- [🛡️ Middleware](./middleware.md) - Process requests before and after route handlers
- [📥 Request & Response](./request-response.md) - Work with HTTP data in your routes
- [✅ Validation](./validation.md) - Validate route parameters and request data
