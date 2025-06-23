FROM node:22-slim AS base

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PNPM_HOME=/home/node/.pnpm-global
ENV PATH=$PNPM_HOME:$NPM_CONFIG_PREFIX/bin:$PATH
ENV DO_NOT_TRACK=1

RUN npm install -g pnpm@10.8.1

FROM base AS builder

# Set working directory
WORKDIR /app

RUN pnpm add -g turbo@^2.4.4
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune @mweb/xen-tg-app --docker

COPY tsconfig.base.json ./out/json/tsconfig.base.json
COPY tsconfig.base.json ./out/full/tsconfig.base.json

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm run build

# production environment
FROM nginx:stable-alpine
COPY --from=installer /app/xen-tg-app/dist /usr/share/nginx/html
COPY --from=installer /app/xen-tg-app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]