FROM node:24-alpine AS dependencies

WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM node:24-alpine AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080

RUN addgroup --system --gid 10001 lfa \
    && adduser --system --uid 10001 --ingroup lfa --home /app lfa

WORKDIR /app
COPY --from=dependencies --chown=lfa:lfa /app/node_modules ./node_modules
COPY --chown=lfa:lfa package.json ./package.json
COPY --chown=lfa:lfa migrations ./migrations
COPY --chown=lfa:lfa scripts ./scripts
COPY --chown=lfa:lfa src ./src

USER 10001:10001
EXPOSE 8080

CMD ["node", "src/server.js"]
