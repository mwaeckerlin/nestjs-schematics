import {Controller, UseInterceptors, ClassSerializerInterceptor, UsePipes, ValidationPipe} from '@nestjs/common'
import {<%= classify(name) %>Service} from './<%= dasherize(name) %>.service'

@Controller('<%= dasherize(name) %>')
@UsePipes(new ValidationPipe({transform: true}))
@UseInterceptors(ClassSerializerInterceptor)
export class <%= classify(name) %>Controller {
  constructor(private readonly <%= lowercased(name) %>Service: <%= classify(name) %>Service) {}
}
