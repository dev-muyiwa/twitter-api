FROM node:20.5.1

RUN npm install -g nodemon

WORKDIR /twitter-api/followings

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3003

CMD ["npm", "run", "start"]