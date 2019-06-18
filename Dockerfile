FROM node:8.16.0-alpine
MAINTAINER matthew6174@gmail.com

WORKDIR /app
COPY . .
RUN yarn install
CMD ["yarn", "start"]
