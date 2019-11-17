FROM node:12.13.0-alpine

WORKDIR /usr/src/cognitive-node

COPY package*.json ./

RUN npm install

RUN npm install -g nodemon

EXPOSE 8080

ENTRYPOINT []
CMD [ "nodemon" ]
