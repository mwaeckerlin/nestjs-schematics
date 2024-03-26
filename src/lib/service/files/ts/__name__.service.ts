import {Injectable, Inject, Logger} from '@nestjs/common'
import {ClientKafka} from '@nestjs/microservices'

@Injectable()
export class <%= classify(name) %>Service {
  private readonly logger = new Logger(this.constructor.name)
  constructor(@Inject('kafka') private kafka: ClientKafka) {}
}
