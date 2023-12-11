ARG DOCKER_REPOSITORY
ARG DOCKER_TAG
FROM ${DOCKER_REPOSITORY}/base:${DOCKER_TAG:-latest} AS build
COPY --chown=${BUILD_USER} . <%= path %>/<%= name %>
RUN npm install
RUN npx nx run <%= name %>:build
ENV NODE_ENV 'production'
RUN find -name node_modules -prune -exec rm -rf {} \;
RUN npm install
WORKDIR <%= path %>/<%= name %>
RUN nexe --build --python=$(which python3) -r "temp" -r "dist/migrations" -o app dist/src/main.js

FROM mwaeckerlin/nodejs as production
EXPOSE <%= port %>
COPY --from=build /app/<%= path %>/<%= name %>/app /app/app
CMD ["/app/app", "--trace-uncaught"]
