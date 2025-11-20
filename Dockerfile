FROM node:16.20.2-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 7000

CMD ["node", "dist/server.js"]