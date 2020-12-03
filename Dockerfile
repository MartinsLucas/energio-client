FROM node:10

COPY . /energio-client
WORKDIR /energio-client

RUN yarn global add @quasar/cli