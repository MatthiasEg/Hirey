FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY ./ ./

RUN npm run build

RUN chown -R node:node ./ && chmod -R 777 ./

USER node 

CMD [ "npm", "start" ]