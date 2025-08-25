# BlitzBun Framework

A modern, fast, and secure web framework built with Bun.

## Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Bun](https://bun.sh/) (for local development)

## Quick Start

### 1. Create New Project

Use the BlitzBun CLI to create a new project:

```bash
# Install the CLI globally
bun add -g @blitzbun/create-blitzbun

# Create a new project
create-blitzbun my-app

# Navigate to your project
cd my-app
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit the `.env` file with your preferred database credentials:

```env
APP_ENV=dev
APP_PORT=8000

REDIS_PORT=6379
REDIS_HOST=redis
REDIS_PASSWORD=

POSTGRES_PORT=5432
POSTGRES_HOST=postgres
POSTGRES_USER=postgres_user
POSTGRES_DATABASE=postgres_db
POSTGRES_PASSWORD=postgres_pass
```

### 3. Install Dependencies and Start Services

Install dependencies and start the development environment:

```bash
# Install dependencies
bun install

# Start all services with Docker Compose
docker-compose up -d
```

This will start:

- **PostgreSQL** (PostGIS-enabled) on port `5432`
- **Redis** on port `6380`
- **Caddy** reverse proxy on ports `80` and `443`
- **Application** on port `8000`

### 4. Run Database Migrations

After the containers are running, execute the database migrations:

```bash
# Generate migrations (if you've made schema changes)
bun drizzle-kit generate

# Apply migrations to the database
bun drizzle-kit migrate
```

### 5. Access Your Application

- **Application**: <http://localhost> (via Caddy) or <http://localhost:8000> (direct)
- **Database**: localhost:5432
- **Redis**: localhost:6380

## Development Commands

### Database Operations

```bash
# Generate new migrations after schema changes
bun drizzle-kit generate

# Apply migrations to database
bun drizzle-kit migrate

# Open Drizzle Studio (database browser)
bun drizzle-kit studio
```

### Application Commands

```bash
# Development server (hot reload)
bun run dev

# Production build and serve
bun run serve

# Run console commands
bun run console

# Start background worker
bun run worker

# Start cron jobs
bun run cron

# Run tests
bun test

# Linting and formatting
bun run lint
bun run lint:fix
bun run format
bun run format:check
```

## Project Structure

```text
my-app/
├── src/
│   ├── configs/          # Configuration files
│   ├── modules/          # Application modules
│   │   └── home/         # Example home module
│   ├── console/          # CLI commands and crons
│   ├── index.ts          # Main application entry
│   ├── console.ts        # Console entry point
│   ├── worker.ts         # Background worker entry
│   └── cron.ts           # Cron jobs entry
├── database/
│   ├── migrations/       # Database migration files
│   └── seeders/          # Database seed files
├── translations/         # Internationalization files
├── docker-compose.yml    # Docker services configuration
├── Dockerfile            # Application container
├── drizzle.config.ts     # Drizzle ORM configuration
└── Caddyfile            # Caddy reverse proxy config
```

## Database Schema

The framework uses Drizzle ORM with PostgreSQL. Database models are located in:

- `src/modules/*/models/*.ts` - Module-specific models
- `packages/*/src/models/*.ts` - Shared models

## Services

### PostgreSQL

- **Image**: `postgis/postgis:15-3.3`
- **Port**: `5432`
- **Extensions**: PostGIS for geospatial data

### Redis

- **Image**: `redis:latest`
- **Port**: `6380` (mapped from `6379`)
- **Usage**: Caching and session storage

### Caddy

- **Image**: `caddy:latest`
- **Ports**: `80`, `443`
- **Usage**: Reverse proxy and automatic HTTPS

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL container is running: `docker-compose ps`
2. Check database credentials in `.env`
3. Verify network connectivity: `docker-compose logs postgres`

### Migration Failures

1. Check database connection
2. Ensure migrations folder exists: `mkdir -p database/migrations`
3. Verify Drizzle configuration in `drizzle.config.ts`

### Port Conflicts

If you encounter port conflicts, modify the ports in `docker-compose.yml`:

```yaml
ports:
  - '5433:5432' # Change PostgreSQL port
  - '6381:6379' # Change Redis port
```

### Container Issues

```bash
# View logs
docker-compose logs <service-name>

# Restart services
docker-compose restart

# Rebuild containers
docker-compose build --no-cache
```

## Contributing

1. Follow the existing code structure and patterns
2. Add tests for new functionality
3. Run linting and formatting before committing
4. Update migrations for database changes

## License

[Add your license information here]
