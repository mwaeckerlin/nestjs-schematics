<% if (type === 'graphql-code-first') { %>import {ObjectType, Field, Int} from '@nestjs/graphql'

@ObjectType()
export class <%= singular(classify(name)) %> {
  @Field(() => Int, {description: 'Example field (placeholder)'})
  exampleField: number
}<% } else { %>import {Entity} from '@mikro-orm/core'
import {PartialType, OmitType} from '@nestjs/swagger'
import {Base} from '../base'

const PROTECTED_KEYS: (keyof <%= singular(classify(name)) %>)[] = ['id', 'updatedAt', 'createdAt']
type ProtectedKeys = typeof PROTECTED_KEYS[number]

@Entity()
export class <%= singular(classify(name)) %> extends Base {
  constructor(create<%= singular(classify(name)) %>: Omit<<%= singular(classify(name)) %>, ProtectedKeys>) {
    super()
    Object.assign(this, create<%= singular(classify(name)) %>)
  }
}<% } %>

export class Create<%= singular(classify(name)) %> extends OmitType(<%= singular(classify(name)) %>, PROTECTED_KEYS) {}
export class Update<%= singular(classify(name)) %> extends PartialType(Create<%= singular(classify(name)) %>) {}
