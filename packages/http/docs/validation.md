# Validation

BlitzBun provides a powerful validation system using Zod schemas for type-safe input validation.

## Creating Validators

Generate a validator for your input:

```bash
bun console create:validator --module=users --validator=create
```

This creates `modules/users/validators/create.ts`:

```typescript
import { z } from 'zod';
import type { HttpRequestContract } from '@blitzbun/contracts';

export default function createUserValidator(req?: HttpRequestContract) {
  return z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string(),
      age: z.number().min(18, 'Must be at least 18 years old').optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });
}
```

## Using Validators in Controllers

### Basic Validation

```typescript
export class UserController extends BaseController {
  async store(request: HttpRequest, response: HttpResponse) {
    const validator = req.getValidator('create');

    if (await validator.fails()) {
      return res.status(400).json({
        success: false,
        errors: validator.getErrors(),
      });
    }

    return response.status(201).json({
      success: true,
    });
  }
}
```
