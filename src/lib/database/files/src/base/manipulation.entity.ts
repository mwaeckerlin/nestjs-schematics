import {Entity, Property} from '@mikro-orm/core'

@Entity({abstract: true})
export abstract class Manipulation {

  @Property({ defaultRaw: 'now()' })
  createdAt: Date

  @Property({ defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date

}
