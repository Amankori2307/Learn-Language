FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5000

ENTRYPOINT ["/app/docker/entrypoint.sh"]
