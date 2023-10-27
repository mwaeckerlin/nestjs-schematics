<%

const naming = (crud && type !== 'graphql-code-first' && type !== 'graphql-schema-first') ? 'dto' : crud ? 'input' : 'dto'

%>import {Injectable, Inject, Logger} from '@nestjs/common'
import {ClientKafka} from '@nestjs/microservices'
<% if (crud) { %>import {EntityManager} from '@mikro-orm/core'
import { <%= singular(classify(name)) %> } from './<%= singular(name) %>.entity'
import {Create<%= singular(classify(name)) %> } from './<%= singular(name) %>.create.<%= naming %>'
import {Update<%= singular(classify(name)) %> } from './<%= singular(name) %>.update.<%= naming %>'
<% } %>
@Injectable()
export class <%= classify(name) %>Service {<% if (crud) { %>
  private readonly logger = new Logger('<%= classify(name) %>Service')
  constructor(@Inject('kafka') private kafka: ClientKafka, private readonly em: EntityManager) {}

  async create(<% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>create<%= singular(classify(name)) %>: Create<%= singular(classify(name)) %><% } else { %>create<%= singular(classify(name)) %>Input: Create<%= singular(classify(name)) %>Input<% } %>): Promise<<%= singular(classify(name)) %>> {
    const <%= lowercased(singular(name)) %> = new <%= singular(classify(name)) %>(create<%= singular(classify(name)) %>)
    await this.em.persistAndFlush(<%= lowercased(singular(name)) %>)
    this.kafka.emit('<%= lowercased(singular(name)) %> created', <%= lowercased(singular(name)) %>)
    return <%= lowercased(singular(name)) %>
  }

  async findAll(query: Record<string, any> = {}): Promise<<%= singular(classify(name)) %>[]> {
    return await this.em.find(<%= singular(classify(name)) %>, query)
  }

  async findOne(id: string | Record<string, any> = {}): Promise<<%= singular(classify(name)) %>> {
    return this.em.findOneOrFail(<%= singular(classify(name)) %>, id)
  }

  async update(id: string | Record<string, any> = {}, <% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>update<%= singular(classify(name)) %>: Update<%= singular(classify(name)) %><% } else { %>update<%= singular(classify(name)) %>Input: Update<%= singular(classify(name)) %>Input<% } %>): Promise<<%= singular(classify(name)) %>> {
    return await this.em.transactional(async (em) => {
      const <%= lowercased(singular(name)) %> = await em.findOneOrFail(<%= singular(classify(name)) %>, id)
      Object.assign(<%= lowercased(singular(name)) %>, update<%= singular(classify(name)) %>, {merge: true})
      await em.persistAndFlush(<%= lowercased(singular(name)) %>)
      this.kafka.emit('<%= lowercased(singular(name)) %> updated', <%= singular(classify(name)) %>)
      return <%= lowercased(singular(name)) %>
    })
  }

  async remove(id: string | Record<string, any> = {}): Promise<<%= singular(classify(name)) %>> {
    const <%= lowercased(singular(name)) %> = await this.em.findOneOrFail(<%= singular(classify(name)) %>, id)
    await this.em.removeAndFlush(<%= lowercased(singular(name)) %>)
    this.kafka.emit('<%= lowercased(singular(name)) %> deleted', <%= singular(classify(name)) %>)
    return <%= lowercased(singular(name)) %>
  }
<% } %>}
