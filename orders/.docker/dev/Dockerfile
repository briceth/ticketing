ARG NODE_VERSION=16
ARG APP_DIR=/usr/src/app

FROM node:${NODE_VERSION}-alpine

#create a folder with node ownership
ARG APP_DIR
WORKDIR ${APP_DIR}

#USER node 

ENV NODE_ENV=development

COPY package.json package-lock.json tsconfig.json ./
COPY src ./src

RUN npm ci

CMD ["npm", "run", "dev"]