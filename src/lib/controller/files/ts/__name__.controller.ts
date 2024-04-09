import {Controller, UseInterceptors, ClassSerializerInterceptor, UsePipes, ValidationPipe, Logger} from '@nestjs/common'
import {<%= classify(name) %>Service} from './<%= dasherize(name) %>.service'

@Controller('<%= dasherize(project) %>/<%= dasherize(name) %>')
@UsePipes(new ValidationPipe({transform: true}))
@UseInterceptors(ClassSerializerInterceptor)
export class <%= classify(name) %>Controller {
  readonly logger = new Logger(this.constructor.name)
  constructor(private readonly <%= lowercased(name) %>: <%= classify(name) %>Service) {}
}
