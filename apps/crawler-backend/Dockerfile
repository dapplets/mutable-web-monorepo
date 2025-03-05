FROM node:current-alpine as base
    
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
# Set working directory
WORKDIR /app

RUN pnpm add -g turbo@^2
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "web" is the name entered in the project's package.json: { name: "web" }
RUN turbo telemetry disable
RUN turbo prune @mweb/crawler-backend --docker
 
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install
 
# Build the project
COPY --from=builder /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=builder /app/out/full/ .
RUN pnpm run build --filter @mweb/crawler-backend
 
FROM base AS runner
WORKDIR /app
 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 app
USER app

COPY --from=installer --chown=app:nodejs /app ./

CMD node apps/crawler-backend/dist/main.js