ARG DOCKER_REPOSITORY
FROM ${DOCKER_REPOSITORY}/base AS build
COPY --chown=${BUILD_USER} . <%= path %>/<%= name %>
RUN npm install
RUN npx nx run <%= name %>:build
RUN nexe --build --python=$(which python3) -o app <%= path %>/<%= name %>/dist/src/main.js

FROM mwaeckerlin/nodejs as production
EXPOSE 4000 CHANGEME
COPY --from=build /app/app /app/app
CMD ["/app/app", "--trace-uncaught"]
