FROM node:20.5.1

RUN npm install -g nodemon

WORKDIR /usr/src/app/twitter-api/auth-service

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]