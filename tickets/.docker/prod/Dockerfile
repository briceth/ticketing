ARG NODE_VERSION=16
ARG APP_DIR=/usr/src/app

################################
#     Dependencies Container   #
################################
FROM node:${NODE_VERSION}-alpine AS deps
ARG APP_DIR

WORKDIR ${APP_DIR}

COPY package.json package-lock.json tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm ci --omit=dev --ignore-scripts

################################
#  Prod Dependencies Container #
################################
FROM node:${NODE_VERSION}-alpine AS builder
ARG APP_DIR

WORKDIR ${APP_DIR}

COPY --from=deps ${APP_DIR}/package.json ${APP_DIR}/package-lock.json ${APP_DIR}/tsconfig.json ${APP_DIR}/tsconfig.build.json ./
COPY --from=deps ${APP_DIR}/node_modules ./node_modules
COPY --from=deps ${APP_DIR}/src ./src

RUN npm install -D "typescript@4.7.3"
RUN npm run build
RUN npm prune --production

################################
#     Distroless Container     #
################################
FROM gcr.io/distroless/nodejs:${NODE_VERSION} AS runner
ARG APP_DIR

WORKDIR ${APP_DIR}

ENV NODE_ENV=production

COPY --from=builder ${APP_DIR}/build ./
COPY --from=builder ${APP_DIR}/node_modules ./node_modules

# Execute as a non-root user
USER 1000

CMD ["index.js"]