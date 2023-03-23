FROM mwaeckerlin/nodejs-build AS build
COPY package.json package-lock.json .
RUN npm i
COPY . .
RUN npm run build

FROM mwaeckerlin/nodejs-build AS node-modules
ENV NODE_ENV "production"
COPY package.json package-lock.json .
RUN npm i

FROM mwaeckerlin/node as production
COPY --from=build dist .
COPY --from=node-modules node-modules .