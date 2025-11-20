FROM node:22
WORKDIR /usr/src/app
COPY ./package*.json /usr/src/app/

# RUN npm install
RUN npm install && npm install -g nodemon
COPY ./ /usr/src/app/
EXPOSE 8008