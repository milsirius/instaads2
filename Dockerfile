FROM node:10.15.1-alpine
WORKDIR /app
COPY package.json /app
RUN npm install
COPY src/. /app/src
CMD ["npm","start"]