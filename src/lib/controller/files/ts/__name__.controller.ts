import {Controller, Logger} from '@nestjs/common'
import {UseClassSerializer, UseValidation} from '@scrypt-swiss/nest'
import {<%= classify(name) %>Service} from './<%= dasherize(name) %>.service'

@Controller('<%= dasherize(project) %>/<%= dasherize(name) %>')
@UseValidation()
@UseClassSerializer()
export class <%= classify(name) %>Controller {
  readonly logger = new Logger(this.constructor.name)
  constructor(private readonly <%= lowercased(name) %>: <%= classify(name) %>Service) {}
}
