FROM node:20.5.1

RUN npm install -g nodemon

WORKDIR /twitter-api/notification

#RUN npm install -g npm@10.1.0`

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3002

CMD ["npm", "run", "start"]