import { WebSocketGateway<% if (crud) { %>, SubscribeMessage, MessageBody<% } %> } from '@nestjs/websockets'
import { <%= classify(name) %>Service } from './<%= name %>.service'<% if (crud) { %>
import { Create<%= singular(classify(name)) %> } from '.<%= singular(name) %>.create.dto'
import { Update<%= singular(classify(name)) %> } from '.<%= singular(name) %>.update.dto'<% } %>

@WebSocketGateway()
export class <%= classify(name) %>Gateway {
  constructor(private readonly <%= lowercased(name) %>Service: <%= classify(name) %>Service) {}<% if (crud) { %>

  @SubscribeMessage('create<%= singular(classify(name)) %>')
  create(@MessageBody() create<%= singular(classify(name)) %>: Create<%= singular(classify(name)) %>) {
    return this.<%= lowercased(name) %>Service.create(create<%= singular(classify(name)) %>)
  }

  @SubscribeMessage('findAll<%= classify(name) %>')
  findAll() {
    return this.<%= lowercased(name) %>Service.findAll()
  }

  @SubscribeMessage('findOne<%= singular(classify(name)) %>')
  findOne(@MessageBody() id: string) {
    return this.<%= lowercased(name) %>Service.findOne(id)
  }

  @SubscribeMessage('update<%= singular(classify(name)) %>')
  update(@MessageBody() update<%= singular(classify(name)) %>: Update<%= singular(classify(name)) %>) {
    return this.<%= lowercased(name) %>Service.update(update<%= singular(classify(name)) %>.id, update<%= singular(classify(name)) %>)
  }

  @SubscribeMessage('remove<%= singular(classify(name)) %>')
  remove(@MessageBody() id: string) {
    return this.<%= lowercased(name) %>Service.remove(id)
  }<% } %>
}
