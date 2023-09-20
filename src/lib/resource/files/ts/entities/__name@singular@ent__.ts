<% if (type === 'graphql-code-first') { %>import { ObjectType, Field, Int } from '@nestjs/graphql'

@ObjectType()
export class <%= singular(classify(name)) %> {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}<% } else { %>import { Entity } from '@mikro-orm/core'
import { Base } from '../../base/entities/base.entity'
import { Create<%= singular(classify(name)) %> } from '../dto/create-<%= singular(name) %>.dto'

@Entity()
export class <%= singular(classify(name)) %> extends Base {
  constructor(create<%= singular(classify(name)) %>: Create<%= singular(classify(name)) %>) {
    super()
    Object.assign(this, create<%= singular(classify(name)) %>)
  }
}<% } %>
