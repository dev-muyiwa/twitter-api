FROM node:20.5.1

RUN npm install -g nodemon

WORKDIR /twitter-api/tweets

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3004

CMD ["npm", "run", "start"]