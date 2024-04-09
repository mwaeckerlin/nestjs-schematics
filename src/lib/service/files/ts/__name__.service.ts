import {Injectable, Inject, Logger} from '@nestjs/common'
import {ClientKafka} from '@nestjs/microservices'
import {Topic} from '@scrypt-swiss/api'

@Injectable()
export class <%= classify(name) %>Service {
  readonly logger = new Logger(this.constructor.name)
  constructor(@Inject('kafka') private kafka: ClientKafka) {}
}
