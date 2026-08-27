FROM node:22-alpine
WORKDIR /repo
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile
CMD ["pnpm","nx","start","@workforce-erp/worker"]
