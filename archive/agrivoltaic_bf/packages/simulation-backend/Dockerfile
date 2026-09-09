FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends radiance \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages

RUN corepack enable \
  && corepack prepare pnpm@10.0.0 --activate \
  && pnpm install --frozen-lockfile=false \
  && pnpm build

EXPOSE 8787

CMD ["node", "packages/simulation-backend/dist/index.js"]
