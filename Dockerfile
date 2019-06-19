FROM node:8.16.0-alpine

WORKDIR /app
COPY ./dist .

ENV DEBUG bot.*
CMD ["node", "bundle.js"]
