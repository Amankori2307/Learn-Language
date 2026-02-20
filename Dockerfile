FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client

RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

ENTRYPOINT ["/app/docker/entrypoint.sh"]
