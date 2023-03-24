FROM mwaeckerlin/nodejs-build AS build
COPY --chown=${BUILD_USER} package.json package-lock.json ./
RUN npm install
COPY --chown=${BUILD_USER} . .
RUN npm run build

FROM mwaeckerlin/nodejs-build AS node-modules
COPY --chown=${BUILD_USER} package.json package-lock.json ./
RUN npm install

FROM mwaeckerlin/nodejs as production
EXPOSE 4000
COPY --from=build /app/dist /app/dist
COPY --from=node-modules /app/node_modules node_modules
