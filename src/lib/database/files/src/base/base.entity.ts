import {Entity, PrimaryKey} from '@mikro-orm/core'
import {Manipulation} from './manipulation.entity'

@Entity({abstract: true})
export abstract class Base extends Manipulation {

  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string

}
