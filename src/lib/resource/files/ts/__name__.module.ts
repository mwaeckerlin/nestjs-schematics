import {Module} from '@nestjs/common'
import {ClientsModule, Transport} from '@nestjs/microservices'
import { <%= classify(name) %>Service } from './<%= name %>.service'
<% if (type === 'rest' || type === 'microservice') { %>import { <%= classify(name) %>Controller } from './<%= name %>.controller'<% } %><% if (type === 'graphql-code-first' || type === 'graphql-schema-first') { %>import { <%= classify(name) %>Resolver } from './<%= name %>.resolver'<% } %><% if (type === 'ws') { %>import { <%= classify(name) %>Gateway } from './<%= name %>.gateway'<% } %>

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: '<%= singular(name) %>',
            brokers: [process.env.KAFKA ?? 'localhost:9092'],
          }
        }
      },
    ])
  ],
  <% if (type === 'rest' || type === 'microservice') { %>controllers: [<%= classify(name) %>Controller],
  providers: [<%= classify(name) %>Service]<% } else if (type === 'graphql-code-first' || type === 'graphql-schema-first') { %>providers: [<%= classify(name) %>Resolver, <%= classify(name) %>Service]<% } else { %>providers: [<%= classify(name) %>Gateway, <%= classify(name) %>Service]<% } %>
})
export class <%= classify(name) %>Module {}
