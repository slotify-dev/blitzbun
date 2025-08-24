# @blitzbun/create-blitzbun

CLI tool for creating new BlitzBun applications using the @blitzbun/framework template.

## Installation

### Using npm

```bash
npm install -g @blitzbun/create-blitzbun
```

### Using yarn

```bash
yarn global add @blitzbun/create-blitzbun
```

### Using pnpm

```bash
pnpm add -g @blitzbun/create-blitzbun
```

### Using bun

```bash
bun add -g @blitzbun/create-blitzbun
```

## Usage

### Create a new BlitzBun project

```bash
create-blitzbun my-app
```

This will:

1. Create a new directory called `my-app`
2. Download and extract the @blitzbun/framework template
3. Set up the project structure with all necessary files
4. Update the package.json with your project name

### Available Options

- `--template, -t`: Specify template to use (default: 'default')
- `--help`: Show help information
- `--version`: Show version number

### After Project Creation

Once your project is created, navigate to the directory and install dependencies:

```bash
cd my-app
bun install
```

### Available Scripts

Your new BlitzBun project comes with these pre-configured scripts:

- `bun run dev` - Start development server with hot reload
- `bun run serve` - Start production server
- `bun run console` - Access the BlitzBun console
- `bun run cron` - Start the cron scheduler
- `bun run worker` - Start the worker process
- `bun run test` - Run tests
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier

### Project Structure

Your new project will have the following structure:

```bash
my-app/
├── src/
│   ├── configs/           # Configuration files
│   ├── console/           # Console commands, crons, and jobs
│   ├── modules/           # Application modules
│   ├── console.ts         # Console kernel
│   ├── cron.ts           # Cron scheduler
│   ├── index.ts          # HTTP server entry point
│   └── worker.ts         # Worker process
├── database/
│   ├── migrations/        # Database migrations
│   └── seeders/          # Database seeders
├── tests/                 # Test files
├── translations/          # Localization files
├── docker-compose.yml     # Docker configuration
├── Dockerfile            # Docker image configuration
├── drizzle.config.ts     # Database ORM configuration
└── package.json          # Project configuration
```

### Getting Started

1. **Start the development server:**

   ```bash
   bun run dev
   ```

2. **Configure your database** in `src/configs/db.ts`

3. **Add your routes** in `src/modules/`

4. **Create database migrations** using the console commands

For more information, visit the [BlitzBun documentation](https://github.com/your-repo/blitzbun).

## Development

To work on this CLI tool:

```bash
git clone <repository-url>
cd packages/template
bun install
bun run build
```

## License

MIT
