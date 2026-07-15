# Builds, lints and tests the app, then serves the production bundle.
#   docker build -t solvpath-returns .
#   docker run --rm -p 4173:4173 solvpath-returns
FROM node:22-bookworm-slim

WORKDIR /app
RUN chown node:node /app
USER node

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY --chown=node:node . .
RUN npm run typecheck && npm run lint && npm test && npm run build

EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173", "--strictPort"]
