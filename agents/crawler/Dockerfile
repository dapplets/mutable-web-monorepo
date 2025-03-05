FROM node:current-alpine as base

RUN apk add chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
    
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
# Set working directory
WORKDIR /app

RUN pnpm add -g turbo@^2
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "@mweb/crawler" is the name entered in the project's package.json: { name: "@mweb/crawler" }
RUN turbo telemetry disable
RUN turbo prune @mweb/crawler --docker
 
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install
 
# Build the project
COPY --from=builder /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=builder /app/out/full/ .
RUN pnpm run build --filter=@mweb/crawler
 
FROM base AS runner
WORKDIR /app
 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 app
USER app

COPY --from=installer --chown=app:nodejs /app ./

CMD node agents/crawler/dist/node/index.js start