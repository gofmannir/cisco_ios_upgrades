FROM node:14.4.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5454
EXPOSE 3998

CMD ["npm","run","start"]