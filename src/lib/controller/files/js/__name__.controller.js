import { Controller, UseInterceptors, ClassSerializerInterceptor, UsePipes, ValidationPipe } from '@nestjs/common'

@Controller('<%= dasherize(name) %>')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe({transform: true}))
export class <%= classify(name) %>Controller {}
