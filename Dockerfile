FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

EXPOSE 9000

CMD ["npm", "run", "start:prod"]
