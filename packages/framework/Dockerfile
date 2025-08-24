FROM oven/bun:latest
WORKDIR /app

# Install ffmpeg
RUN apt-get update && \
    rm -rf /var/lib/apt/lists/*

# copy code
COPY package.json /app/package.json

# Install dependencies
RUN bun install

# copy code
COPY . .

# Start development server
CMD ["bun", "run", "dev"]
