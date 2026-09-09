# One image for both processes. The app runs the adapter-node build, the worker runs
# the queue entry point, and both carry the same migrations.
FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm build

FROM base AS runtime
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/build ./build
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/src ./src
COPY --from=build /app/worker ./worker
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/.svelte-kit/tsconfig.json ./.svelte-kit/tsconfig.json
EXPOSE 3000
CMD ["node", "build/index.js"]
