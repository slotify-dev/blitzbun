# How to publish packages

```bash
# build scripts
bun run build:scripts

# test version checking
bun run version:check

# dry-run before publish
bun run publish:dry-run

# publish packages
bun run publish:packages

# version updates
bun run version:update patch
bun run version:update minor
bun run version:update major
```
