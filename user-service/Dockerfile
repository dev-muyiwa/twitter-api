FROM node:20.5.1

RUN npm install -g nodemon

WORKDIR /usr/src/app/twitter-api/user-service

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "start"]