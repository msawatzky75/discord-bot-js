FROM node:20-alpine as build
WORKDIR /app
COPY . .
RUN npm run build
ENV DEBUG=bot.*
CMD ["npm", "run", "start"]
