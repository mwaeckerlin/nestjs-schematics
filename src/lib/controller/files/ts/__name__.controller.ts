import {Controller, UseInterceptors, ClassSerializerInterceptor} from '@nestjs/common'
import {<%= classify(name) %>Service} from './<%= dasherize(name) %>.service'

@Controller('/<%= dasherize(name) %>')
@UseInterceptors(ClassSerializerInterceptor)
export class <%= classify(name) %>Controller {
  constructor(private readonly <%= lowercased(name) %>Service: <%= classify(name) %>Service) {}
}
