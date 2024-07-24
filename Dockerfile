FROM node:20.11.0-alpine3.18 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i

COPY ./ ./
# RUN npx tsc

CMD ["npm", "start"]