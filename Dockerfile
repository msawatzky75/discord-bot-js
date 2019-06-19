FROM node:8.16.0-alpine as build
WORKDIR /app
COPY . .
RUN yarn install && yarn build

FROM node:8.16.0-alpine
COPY --from=build /app/dist /
ENV DEBUG bot.*
CMD ["node", "bundle.js"]
