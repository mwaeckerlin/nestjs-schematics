import {Injectable, Inject, Logger} from '@nestjs/common'
import {ClientKafka} from '@nestjs/microservices'
<% if (crud) { %>import {EntityManager, FilterQuery} from '@mikro-orm/core'
import {Topic} from '@scrypt-swiss/api'
import {<%= singular(classify(name)) %>, Create<%= singular(classify(name)) %>, Update<%= singular(classify(name)) %>} from './<%= singular(name) %>.entity'
<% } %>
@Injectable()
export class <%= classify(name) %>Service {<% if (crud) { %>
  readonly logger = new Logger(this.constructor.name)
  constructor(@Inject('kafka') private kafka: ClientKafka, private readonly em: EntityManager) {}

  async create(<% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>create<%= singular(classify(name)) %>: Create<%= singular(classify(name)) %><% } else { %><%= singular(classify(name)) %>Input: <%= singular(classify(name)) %>Input<% } %>): Promise<<%= singular(classify(name)) %>> {
    const <%= lowercased(singular(name)) %> = new <%= singular(classify(name)) %>(create<%= singular(classify(name)) %>)
    await this.em.persistAndFlush(<%= lowercased(singular(name)) %>)
    this.kafka.emit(Topic.<%= uppercased(singular(name)) %>_CREATED, <%= lowercased(singular(name)) %>)
    return <%= lowercased(singular(name)) %>
  }

  async findAll(query: FilterQuery<<%= singular(classify(name)) %>> = {}): Promise<<%= singular(classify(name)) %>[]> {
    return await this.em.find(<%= singular(classify(name)) %>, query)
  }

  async findOne(id: string | FilterQuery<<%= singular(classify(name)) %>> = {}): Promise<<%= singular(classify(name)) %>> {
    return this.em.findOneOrFail(<%= singular(classify(name)) %>, id)
  }

  async update(id: string | FilterQuery<<%= singular(classify(name)) %>> = {}, <% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>update<%= singular(classify(name)) %>: Update<%= singular(classify(name)) %><% } else { %>update<%= singular(classify(name)) %>Input: Update<%= singular(classify(name)) %>Input<% } %>): Promise<<%= singular(classify(name)) %>> {
    return await this.em.transactional(async (em) => {
      const <%= lowercased(singular(name)) %> = await em.findOneOrFail(<%= singular(classify(name)) %>, id)
      Object.assign(<%= lowercased(singular(name)) %>, update<%= singular(classify(name)) %>)
      await em.persistAndFlush(<%= lowercased(singular(name)) %>)
      this.kafka.emit(Topic.<%= uppercased(singular(name)) %>_UPDATED, <%= lowercased(singular(name)) %>)
      return <%= lowercased(singular(name)) %>
    })
  }

  async remove(id: string | FilterQuery<<%= singular(classify(name)) %>> = {}): Promise<<%= singular(classify(name)) %>> {
    const <%= lowercased(singular(name)) %> = await this.em.findOneOrFail(<%= singular(classify(name)) %>, id)
    await this.em.removeAndFlush(<%= lowercased(singular(name)) %>)
    this.kafka.emit(Topic.<%= uppercased(singular(name)) %>_DELETED, <%= lowercased(singular(name)) %>)
    return <%= lowercased(singular(name)) %>
  }
<% } %>}
