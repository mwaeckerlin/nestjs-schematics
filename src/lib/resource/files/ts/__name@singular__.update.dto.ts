<% if (isSwaggerInstalled) { %>import { PartialType } from '@nestjs/swagger'<% } else { %>import { PartialType } from '@nestjs/mapped-types'<% } %>
import { Create<%= singular(classify(name)) %> } from './<%= singular(name) %>.create.dto'

export class Update<%= singular(classify(name)) %> extends PartialType(Create<%= singular(classify(name)) %>) {<% if ((type === 'microservice' || type === 'ws') && crud) { %>
  id: string
<% }%>}
