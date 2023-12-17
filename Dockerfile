FROM node:20-alpine as build
WORKDIR /app
COPY . .
RUN yarn build
ENV DEBUG=bot.*
CMD ["yarn", "start"]
