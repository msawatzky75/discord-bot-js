FROM node:lts-alpine as build
WORKDIR /app
COPY . .
RUN yarn build
ENV DEBUG bot.info
CMD ["yarn", "start"]
