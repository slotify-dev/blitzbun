# @blitzbun/http

BlitzBun's comprehensive HTTP package for building high-performance web applications and APIs.

## 📖 Documentation

For complete documentation, guides, and examples, see the [docs](./docs/) folder:

- [📖 Overview](./docs/overview.md) - Package overview and quick start
- [🛣️ Routing](./docs/routing.md) - URL routing and parameter handling  
- [🎮 Controllers](./docs/controllers.md) - Request handling and organization
- [📥 Request & Response](./docs/request-response.md) - HTTP data management
- [🛡️ Middleware](./docs/middleware.md) - Request/response processing
- [✅ Validation](./docs/validation.md) - Input validation and sanitization
- [🔌 WebSocket](./docs/websocket.md) - Real-time communication
- [🔄 Transformer](./docs/transformer.md) - Data transformation

## Installation

```bash
bun add @blitzbun/http
```

## Quick Start

```typescript
import { Application } from '@blitzbun/core';
import { HttpKernel } from '@blitzbun/http';

const app = new Application(__dirname);
const kernel = new HttpKernel(app);

// Start the server
await kernel.handle();
```

See the [complete documentation](./docs/overview.md) for detailed usage examples.
