FROM node:8.16.0-alpine
MAINTAINER matthew6174@gmail.com

WORKDIR /app
COPY ./src ./src
COPY ./package.json .
COPY ./yarn.lock .
COPY ./tsconfig.json .

RUN yarn install
CMD ["yarn", "start"]
