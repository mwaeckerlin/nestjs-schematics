import {Entity, PrimaryKey} from '@mikro-orm/core'
import {v4} from 'uuid'
import {Manipulation} from './manipulation.entity'

@Entity({abstract: true})
export abstract class Base extends Manipulation {

  @PrimaryKey()
  id: string = v4()

}
