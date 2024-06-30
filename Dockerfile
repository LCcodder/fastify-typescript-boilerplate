FROM node:20.11.0-alpine3.18 AS development

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

RUN tsc

FROM node:20.11.0-alpine3.18 AS production

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm install --omit=dev

COPY --chown=node:node --from=development /app/build .

USER node

CMD ["node", "./main.js"]