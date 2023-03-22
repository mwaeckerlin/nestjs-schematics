<% if (crud) { %>import { EntityManager } from '@mikro-orm/core'<% } %>
import { <%= singular(classify(name)) %> } from './entities/<%= singular(name) %>.entity'
import { Injectable } from '@nestjs/common'<% if (crud && type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>
import { Create<%= singular(classify(name)) %>Dto } from './dto/create-<%= singular(name) %>.dto'
import { Update<%= singular(classify(name)) %>Dto } from './dto/update-<%= singular(name) %>.dto'<% } else if (crud) { %>
import { Create<%= singular(classify(name)) %>Input } from './dto/create-<%= singular(name) %>.input'
import { Update<%= singular(classify(name)) %>Input } from './dto/update-<%= singular(name) %>.input'<% } %>

@Injectable()
export class <%= classify(name) %>Service {<% if (crud) { %>
  constructor(private readonly em: EntityManager) {}

  async create(<% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto<% } else { %>create<%= singular(classify(name)) %>Input: Create<%= singular(classify(name)) %>Input<% } %>): Promise<<%= singular(classify(name)) %>> {
    const new<%= singular(classify(name)) %> = new <%= singular(classify(name)) %>(create<%= singular(classify(name)) %>Dto)
    await this.em.persistAndFlush(new<%= singular(classify(name)) %>)
    return new<%= singular(classify(name)) %>
  }

  async findAll(query: Record<string, any> = {}): Promise<<%= singular(classify(name)) %>[]> {
    return await this.em.find(<%= singular(classify(name)) %>, query)
  }

  async findOne(id: string): Promise<<%= singular(classify(name)) %>> {
    return this.em.findOneOrFail(<%= singular(classify(name)) %>, id)
  }

  async update(id: string, <% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto<% } else { %>update<%= singular(classify(name)) %>Input: Update<%= singular(classify(name)) %>Input<% } %>): Promise<<%= singular(classify(name)) %>> {
    return await this.em.transactional(async (em) => {
      const <%= singular(name) %> = await em.findOneOrFail(<%= singular(classify(name)) %>, id)
      Object.assign(<%= singular(name) %>, update<%= singular(classify(name)) %>Dto, { merge: true })
      await em.persistAndFlush(<%= singular(name) %>)
      return <%= singular(name) %>
    })
  }

  async remove(id: string): Promise<<%= singular(classify(name)) %>> {
    const <%= singular(name) %> = await this.em.findOneOrFail(<%= singular(classify(name)) %>, id)
    await this.em.removeAndFlush(<%= singular(name) %>)
    return <%= singular(name) %>  }
<% } %>}
