<% if (crud && type === 'rest') { %>import { Controller, UseInterceptors, ClassSerializerInterceptor, UsePipes, ValidationPipe, Get, Post, Body, Query, Patch, Param, Delete } from '@nestjs/common'<%
} else if (crud && type === 'microservice') { %>import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'<%
} else { %>import { Controller } from '@nestjs/common'<%
} %>
import { <%= classify(name) %>Service } from './<%= name %>.service'<% if (crud) { %>
import { Create<%= singular(classify(name)) %> } from './<%= singular(name) %>.create.dto'
import { Update<%= singular(classify(name)) %> } from './<%= singular(name) %>.update.dto'<% } %>

<% if (type === 'rest') { %>@Controller('<%= dasherize(name) %>')<% } else { %>@Controller()<% } %>
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe({transform: true}))
export class <%= classify(name) %>Controller {
  constructor(private readonly <%= lowercased(name) %>Service: <%= classify(name) %>Service) {}<% if (type === 'rest' && crud) { %>

  @Post()
  create(@Body() create<%= singular(classify(name)) %>: Create<%= singular(classify(name)) %>) {
    return this.<%= lowercased(name) %>Service.create(create<%= singular(classify(name)) %>)
  }

  @Get()
  findAll(@Query() query?: Record<string, any>) {
    return this.<%= lowercased(name) %>Service.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.<%= lowercased(name) %>Service.findOne(id)
  }

  @Get()
  findOneQuery(@Query() query?: Record<string, any>) {
    return this.<%= lowercased(name) %>Service.findOne(query)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() update<%= singular(classify(name)) %>: Update<%= singular(classify(name)) %>) {
    return this.<%= lowercased(name) %>Service.update(id, update<%= singular(classify(name)) %>)
  }

  @Patch()
  updateQuery(@Body() update<%= singular(classify(name)) %>: Update<%= singular(classify(name)) %>, @Query() query?: Record<string, any>) {
    return this.<%= lowercased(name) %>Service.update(query, update<%= singular(classify(name)) %>)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.<%= lowercased(name) %>Service.remove(id)
  }<% } else if (type === 'microservice' && crud) { %>

  @Delete()
  removeQuery(@Query() query?: Record<string, any>) {
    return this.<%= lowercased(name) %>Service.remove(query)
  }<% } else if (type === 'microservice' && crud) { %>
  
  @MessagePattern('create<%= singular(classify(name)) %>')
  create(@Payload() create<%= singular(classify(name)) %>: Create<%= singular(classify(name)) %>) {
    return this.<%= lowercased(name) %>Service.create(create<%= singular(classify(name)) %>)
  }

  @MessagePattern('findAll<%= classify(name) %>')
  findAll(@Payload query?: Record<string, any>) {
    return this.<%= lowercased(name) %>Service.findAll(query)
  }

  @MessagePattern('findOne<%= singular(classify(name)) %>')
  findOne(@Payload() id: string | Record<string, any>) {
    return this.<%= lowercased(name) %>Service.findOne(id)
  }

  @MessagePattern('update<%= singular(classify(name)) %>')
  update(@Payload()id: string | Record<string, any>, @Payload() update<%= singular(classify(name)) %>: Update<%= singular(classify(name)) %>) {
    return this.<%= lowercased(name) %>Service.update(id, update<%= singular(classify(name)) %>)
  }

  @MessagePattern('remove<%= singular(classify(name)) %>')
  remove(@Payload() id: string | Record<string, any>) {
    return this.<%= lowercased(name) %>Service.remove(id)
  }<% } %>
}
