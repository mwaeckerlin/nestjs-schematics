import { Controller, UseInterceptors, ClassSerializerInterceptor, UsePipes, ValidationPipe, <%= functions.imports.join(', ') %> } from '@nestjs/common'
import { <%= functions.dtoImports.join(', ') %> } from '../<%= functions.dtoFileName %>'
import { <%= classify(dasherize(name).toLowerCase()) %>Service } from './<%= name %>.service'

@Controller('<%= dasherize(functions.base) %>')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe({transform: true}))
export class <%= classify(dasherize(name).toLowerCase()) %>Controller {
    constructor(private readonly <%= camelize(classify(dasherize(name).toLowerCase())) %>Service: <%= classify(dasherize(name).toLowerCase()) %>Service) { }
    <%=

    Object.keys(functions.paths).map(path =>
        Object.keys(functions.paths[path]).map(req =>
            '\n\n    @' + req[0].toUpperCase() + req.slice(1) + "('" + path + "')" +
            '\n    ' + (req + path).replace(/[^a-zA-Z0-9]+/, '_') + '('
            + functions.paths[path][req].parameters?.map(p => {
                let res = ''
                switch (p.in) {
                    case 'header':
                        if (!headers) return
                        res = "@Headers('" + p.name + "') " + camelize(classify(dasherize(p.name).toLowerCase()))
                        break
                    case 'query':
                        res = "@Query('" + p.name + "') " + camelize(classify(dasherize(p.name).toLowerCase()))
                        break
                    case 'param':
                        res = "@Param('" + p.name + "') " + camelize(classify(dasherize(p.name).toLowerCase()))
                        break
                    default:
                        return 'unknown: ' + p.in + ' → ' + JSON.stringify(p)
                }
                if (!p.required) res += '?'
                if (p.schema?.dto) res += ': ' + classify(dasherize(p.schema.dto).toLowerCase())
                else if (p.schema?.type) res += ': ' + p.schema.type
                else if (p.schema?.oneOf) res += ': ' + p.schema?.oneOf.map(p => p.dto ? classify(dasherize(p.dto).toLowerCase()) : p.type).join('|')
                return res
            }).filter(x => !!x).concat(
                functions.paths[path][req].requestBody?.content?.["application/json"]?.schema?.properties
                    ? Object.keys(functions.paths[path][req].requestBody.content["application/json"].schema.properties).map(v =>
                        "@Body('" + v + "') " + camelize(classify(dasherize(v).toLowerCase())) + (functions.paths[path][req].requestBody.content["application/json"].schema.properties[v].required?'':'?') +
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
            + ') {\n      this.' +
            camelize(classify(dasherize(name).toLowerCase())) + 'Service.' + (req + path).replace(/[^a-zA-Z0-9]+/, '_')
            + '('
            + functions.paths[path][req].parameters?.filter(p => p.in !== 'header' || headers).map(p => camelize(classify(dasherize(p.name).toLowerCase())))
                .concat(
                    functions.paths[path][req].requestBody?.content?.["application/json"]?.schema?.properties
                        ? Object.keys(functions.paths[path][req].requestBody.content["application/json"].schema.properties).map(v =>
                            camelize(classify(dasherize(v).toLowerCase())))
                        : []
                ).join(', ')
            + ')'
            + '\n    }'
        ).join('\n')
    ).join('\n')

        %>
}
