# Controllers

Controllers in BlitzBun organize your application's request handling logic into clean, manageable classes. They act as the bridge between your routes and business logic, handling HTTP requests and returning appropriate responses.

## What are Controllers?

Controllers are classes that contain methods for handling specific HTTP requests. Each controller method corresponds to a route and contains the logic for processing requests and generating responses.

Think of controllers as traffic controllers at busy intersections - they receive incoming traffic (HTTP requests), decide what to do with them based on the traffic rules (your application logic), and direct them to their proper destination (HTTP responses).

## Purpose

Controllers provide:

- **Request Organization**: Group related request handlers into logical classes
- **Code Reusability**: Share common logic across multiple route handlers
- **Business Logic Separation**: Keep route definitions clean and business logic organized
- **Type Safety**: Full TypeScript support with proper typing
- **Dependency Injection**: Easy access to application services through the container
- **Error Handling**: Centralized error handling patterns

## Basic Usage

### Creating Controllers

Controllers are regular TypeScript classes that receive the application instance through constructor injection:

```typescript
// controllers/user-controller.ts
import { ApplicationContract } from '@blitzbun/contracts';
import { HttpRequestContract, HttpResponseContract } from '@blitzbun/contracts';

export class UserController {
  constructor(private app: ApplicationContract) {}

  async index(req: HttpRequestContract, res: HttpResponseContract) {
    return res.json({
      success: true,
      message: 'Users list'
    });
  }

  async show(req: HttpRequestContract, res: HttpResponseContract) {
    const userId = req.param('id');
    
    return res.json({
      success: true,
      data: { id: userId, name: 'John Doe' }
    });
  }
}
```

### Registering Controllers

Controllers are registered in your route definitions:

```typescript
// routes/web.ts or wherever you define routes
import { UserController } from '../controllers/user-controller';

// Register controller with dependency injection
router.get('/users', app.get<UserController>('UserController').index);
router.get('/users/:id', app.get<UserController>('UserController').show);
```

### Service Injection

Access application services through the application container:

```typescript
export class UserController {
  private userService: any;
  private logger: any;

  constructor(private app: ApplicationContract) {
    // Inject services as needed
    this.userService = app.get('userService');
    this.logger = app.get('logger');
  }

  async index(req: HttpRequestContract, res: HttpResponseContract) {
    try {
      // Use injected services
      const users = await this.userService.getAllUsers();
      
      this.logger.info('Users retrieved', { count: users.length });
      
      return res.json({
        success: true,
        data: users
      });
    } catch (error) {
      this.logger.error('Failed to retrieve users', { error });
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
```

## Controller Methods

### HTTP Method Handlers

Create methods that correspond to different HTTP methods:

```typescript
export class PostController {
  constructor(private app: ApplicationContract) {}

  // GET /posts
  async index(req: HttpRequestContract, res: HttpResponseContract) {
    return res.json({ message: 'All posts' });
  }

  // GET /posts/:id  
  async show(req: HttpRequestContract, res: HttpResponseContract) {
    const postId = req.param('id');
    return res.json({ message: `Post ${postId}` });
  }

  // POST /posts
  async store(req: HttpRequestContract, res: HttpResponseContract) {
    return res.status(201).json({ message: 'Post created' });
  }

  // PUT /posts/:id
  async update(req: HttpRequestContract, res: HttpResponseContract) {
    const postId = req.param('id');
    return res.json({ message: `Post ${postId} updated` });
  }

  // DELETE /posts/:id
  async destroy(req: HttpRequestContract, res: HttpResponseContract) {
    const postId = req.param('id');
    return res.json({ message: `Post ${postId} deleted` });
  }
}
```

### Request Validation

Use the validation system in your controller methods:

```typescript
export class UserController {
  constructor(private app: ApplicationContract) {}

  async store(req: HttpRequestContract, res: HttpResponseContract) {
    // Get validator for this request
    const validator = req.getValidator('users');

    // Check if validation fails
    if (await validator.fails()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validator.getErrors()
      });
    }

    // Validation passed, proceed with creation
    return res.status(201).json({
      success: true,
      message: 'User created successfully'
    });
  }
}
```

## Advanced Controller Patterns

### Resource Controllers

Create controllers that handle all CRUD operations for a resource:

```typescript
export class ResourceController {
  constructor(private app: ApplicationContract) {}

  // GET /resource - List all resources
  async index(req: HttpRequestContract, res: HttpResponseContract) {
    // Implementation here
  }

  // GET /resource/:id - Show specific resource
  async show(req: HttpRequestContract, res: HttpResponseContract) {
    // Implementation here
  }

  // POST /resource - Create new resource
  async store(req: HttpRequestContract, res: HttpResponseContract) {
    // Implementation here
  }

  // PUT /resource/:id - Update existing resource
  async update(req: HttpRequestContract, res: HttpResponseContract) {
    // Implementation here
  }

  // DELETE /resource/:id - Delete resource
  async destroy(req: HttpRequestContract, res: HttpResponseContract) {
    // Implementation here
  }
}
```

### API Controllers

Controllers designed specifically for API responses:

```typescript
export class ApiController {
  constructor(private app: ApplicationContract) {}

  protected success(data: any, message = 'Success', status = 200) {
    return {
      status,
      success: true,
      message,
      data
    };
  }

  protected error(message: string, status = 400, errors: any = null) {
    return {
      status,
      success: false,
      message,
      errors
    };
  }
}

export class UserApiController extends ApiController {
  async index(req: HttpRequestContract, res: HttpResponseContract) {
    const userService = this.app.get('userService');
    const users = await userService.getAllUsers();
    
    const response = this.success(users, 'Users retrieved successfully');
    return res.status(response.status).json(response);
  }

  async show(req: HttpRequestContract, res: HttpResponseContract) {
    const userId = req.param('id');
    const userService = this.app.get('userService');
    
    const user = await userService.findById(userId);
    
    if (!user) {
      const response = this.error('User not found', 404);
      return res.status(response.status).json(response);
    }

    const response = this.success(user, 'User retrieved successfully');
    return res.status(response.status).json(response);
  }
}
```

### Controller with Middleware

Controllers that apply middleware at the class level:

```typescript
export class AuthController {
  constructor(private app: ApplicationContract) {}

  async login(req: HttpRequestContract, res: HttpResponseContract) {
    // Login logic
    return res.json({ message: 'Login successful' });
  }

  async logout(req: HttpRequestContract, res: HttpResponseContract) {
    // Logout logic
    return res.json({ message: 'Logout successful' });
  }

  async profile(req: HttpRequestContract, res: HttpResponseContract) {
    const validator = req.getValidator('profile');
    
    if (await validator.fails()) {
      return res.status(400).json({
        success: false,
        errors: validator.getErrors(),
      });
    }

    return res.status(200).json({
      success: true,
    });
  };
}
```

## Best Practices

1. **Constructor Injection**: Inject dependencies through constructor
2. **Validation**: Always validate request data using validators
3. **Error Handling**: Handle errors gracefully and return appropriate status codes
4. **Logging**: Log important operations and errors for debugging
5. **Authorization**: Check user permissions before sensitive operations
6. **Response Structure**: Maintain consistent response structure across controllers
7. **HTTP Status Codes**: Use appropriate HTTP status codes for different scenarios

## Next Steps

- [Routing](./routing.md) - Define routes that connect to your controllers
- [Middleware](./middleware.md) - Add request processing logic
- [Request & Response](./request-response.md) - Handle HTTP data
- [Validation](./validation.md) - Validate incoming request data