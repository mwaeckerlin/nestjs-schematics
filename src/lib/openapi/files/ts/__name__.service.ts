import { Logger, Injectable } from '@nestjs/common'
import { <%= functions.dtoImports.join(', ') %> } from '../<%= functions.dtoFileName %>'

@Injectable()
export class <%= classify(name) %>Service {
  private readonly logger = new Logger(<%= classify(dasherize(name).toLowerCase()) %>Service.name)<%=

  Object.keys(functions.paths).map(path =>
      Object.keys(functions.paths[path]).map(req =>
          '\n\n    ' + (req + path).replace(/[^a-zA-Z0-9]+/, '_') + '('
          + functions.paths[path][req].parameters?.filter(p => p.in!=='header' || headers).map(p => {
              let res = camelize(classify(dasherize(p.name).toLowerCase()))
              if (p.schema?.dto) res += ': ' + classify(dasherize(p.schema.dto).toLowerCase())
              else if (p.schema?.type) res += ': ' + p.schema.type
              else if (p.schema?.oneOf) res += ': ' + p.schema?.oneOf.map(p => p.dto ? classify(dasherize(p.dto).toLowerCase()) : p.type).join('|')
              return res
          }).filter(x => !!x).concat(
              functions.paths[path][req].requestBody?.content?.["application/json"]?.schema?.properties
                  ? Object.keys(functions.paths[path][req].requestBody.content["application/json"].schema.properties).map(v =>
                      camelize(classify(dasherize(v).toLowerCase())) +
                      (
                          functions.paths[path][req].requestBody.content["application/json"].schema.properties[v].dto
                              ? ': ' + classify(dasherize(functions.paths[path][req].requestBody.content["application/json"].schema.properties[v].dto).toLowerCase())
                              : functions.paths[path][req].requestBody.content["application/json"].schema.properties[v].type
                                  ? ': ' + functions.paths[path][req].requestBody.content["application/json"].schema.properties[v].type
                                  : functions.paths[path][req].requestBody.content["application/json"].schema.properties[v].oneOf ?? []
                                      ? ': ' + functions.paths[path][req].requestBody.content["application/json"].schema.properties[v].oneOf.map(x => x.dto ? classify(dasherize(x.dto).toLowerCase()) : x.type).join('|')
                                      : ''
                      )
                  )
                  : []
          ).join(', ')
          + ') {}'
      ).join('\n')
  ).join('\n')

%>

}
