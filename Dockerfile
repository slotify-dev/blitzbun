FROM oven/bun
WORKDIR /app

# copy code
COPY packages /app/packages
COPY package.json /app/package.json

# Install dependencies
RUN bun install

# copy code
COPY . .

# Start development server
CMD ["bun", "run", "dev"]