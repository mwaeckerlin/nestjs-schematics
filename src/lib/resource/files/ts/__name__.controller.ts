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
  async create(@Body() create<%= singular(classify(name)) %>: Create<%= singular(classify(name)) %>) {
    return this.<%= lowercased(name) %>Service.create(create<%= singular(classify(name)) %>)
  }

  @Get()
  async findAll(@Query() query?: Record<string, any>) {
    return this.<%= lowercased(name) %>Service.findAll(query)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.<%= lowercased(name) %>Service.findOne(id)
  }

  @Get()
  async findOneQuery(@Query() query?: Record<string, any>) {
    return this.<%= lowercased(name) %>Service.findOne(query)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() update<%= singular(classify(name)) %>: Update<%= singular(classify(name)) %>) {
    return this.<%= lowercased(name) %>Service.update(id, update<%= singular(classify(name)) %>)
  }

  @Patch()
  async updateQuery(@Body() update<%= singular(classify(name)) %>: Update<%= singular(classify(name)) %>, @Query() query?: Record<string, any>) {
    return this.<%= lowercased(name) %>Service.update(query, update<%= singular(classify(name)) %>)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.<%= lowercased(name) %>Service.remove(id)
  }<% } else if (type === 'microservice' && crud) { %>

  @Delete()
  async removeQuery(@Query() query?: Record<string, any>) {
    return this.<%= lowercased(name) %>Service.remove(query)
  }<% } else if (type === 'microservice' && crud) { %>
  
  @MessagePattern('create<%= singular(classify(name)) %>')
  async create(@Payload() create<%= singular(classify(name)) %>: Create<%= singular(classify(name)) %>) {
    return this.<%= lowercased(name) %>Service.create(create<%= singular(classify(name)) %>)
  }

  @MessagePattern('findAll<%= classify(name) %>')
  async findAll(@Payload query?: Record<string, any>) {
    return this.<%= lowercased(name) %>Service.findAll(query)
  }

  @MessagePattern('findOne<%= singular(classify(name)) %>')
  async findOne(@Payload() id: string | Record<string, any>) {
    return this.<%= lowercased(name) %>Service.findOne(id)
  }

  @MessagePattern('update<%= singular(classify(name)) %>')
  async update(@Payload()id: string | Record<string, any>, @Payload() update<%= singular(classify(name)) %>: Update<%= singular(classify(name)) %>) {
    return this.<%= lowercased(name) %>Service.update(id, update<%= singular(classify(name)) %>)
  }

  @MessagePattern('remove<%= singular(classify(name)) %>')
  async remove(@Payload() id: string | Record<string, any>) {
    return this.<%= lowercased(name) %>Service.remove(id)
  }<% } %>
}
