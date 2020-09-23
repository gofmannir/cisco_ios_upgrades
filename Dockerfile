FROM node:14.4.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5454

CMD ["node","run","start"]