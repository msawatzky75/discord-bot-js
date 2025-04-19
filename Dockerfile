FROM node
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
ENV DEBUG=bot.*
CMD ["npm", "run", "start"]
