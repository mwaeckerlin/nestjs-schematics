FROM mwaeckerlin/nodejs-build AS build
COPY --chown=${BUILD_USER} package.json package-lock.json ./
COPY --chown=${BUILD_USER} <%= path %>/<%= name %>/package.json ./<%= path %>/<%= name %>/
RUN npm install
COPY --chown=${BUILD_USER} . .
RUN npm install
RUN npx nx run <%= name %>:build
RUN nexe --build --python=$(which python3) -o app <%= path %>/<%= name %>/dist/src/main.js

FROM mwaeckerlin/nodejs as production
EXPOSE 4000
COPY --from=build /app/app /app/app
CMD ["/app/app", "--trace-uncaught"]
