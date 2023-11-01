import {Injectable, Logger} from '@nestjs/common'

@Injectable()
export class <%= classify(name) %>Service {
  private readonly logger = new Logger(this.constructor.name)
}
