import { join, Path, strings } from '@angular-devkit/core'
import { camelize, classify, dasherize } from '@angular-devkit/core/src/utils/strings'
import { apply, branchAndMerge, chain, DirEntry, filter, mergeWith, move, noop, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics'
import * as yaml from 'js-yaml'
import { DeclarationOptions, Location, ModuleDeclarator, ModuleFinder, NameParser } from '../../utils'
import { main as createController } from '../controller/controller.factory'
import { ControllerOptions } from '../controller/controller.schema'

const typeName = name => name ? classify(dasherize(name).toLowerCase()) : null
const varName = name => name ? camelize(typeName(name)) : null

export function main(options: any): Rule {
    // stupid nest is hard coded, so fix the arguments
    options.openapi = options.name
    options.name = options.path
    options.path = null
    return (tree: Tree, _context: SchematicContext) => {
        const { controllers, schemas } = getControllers(tree, options)
        const dtoFileName = (options.name ? options.name + '/' : '') + 'dto/' + (options.name ? dasherize(options.name) : options.openapi.replace('.json', '')) + '.dto'
        if (schemas) {
            tree.create(options.sourceRoot + '/' + dtoFileName + '.ts', Object.keys(schemas)?.map(name => {
                const normName = typeName(name)
                if (schemas[name].dto) {
                    return 'export type ' + normName + ' = ' + typeName(schemas[name].dto)
                }
                if (schemas[name].enum) {
                    return 'export enum ' + normName + ' {\n'
                        + schemas[name].enum.map(val =>
                            '  ' + typeName(val) + " = '" + val + "'"
                        ).join(',\n')
                        + '\n}'
                }
                switch (schemas[name].type) {
                    case 'string':
                    case 'number':
                        return 'export type ' + normName + ' = ' + schemas[name].type
                    case 'object':
                        return 'export class ' + normName + ' {\n'
                            + Object.keys(schemas[name].properties)?.map(p =>
                                '  ' + varName(p) + ': ' +
                                (
                                    typeName(schemas[name].properties[p].dto)
                                    ??
                                    (
                                        ['string', 'number'].includes(schemas[name].properties[p].type)
                                            ?
                                            schemas[name].properties[p].type
                                            :
                                            (
                                                schemas[name].properties[p].type === 'array'
                                                    ?
                                                    (
                                                        (
                                                            typeName(schemas[name].properties[p].items?.dto)
                                                            ??
                                                            schemas[name].properties[p].items?.type
                                                        ) + '[]'
                                                    )
                                                    :
                                                    typeName(schemas[name].properties[p].items?.type)
                                            )
                                    )
                                )
                            ).join('\n')
                            + '\n}'
                    case 'array':
                        return 'export type ' + normName + ' = ' + typeName(schemas[name].items.dto ?? schemas[name].items.type) + '[]'
                    default:
                        throw new Error('UNKNOWN TYPE: ' + schemas[name].type + ' in schema ' + name)
                }
            }).join('\n\n'))
        }
        const createControllers = Object.keys(controllers).map(c =>
            createController({
                ...options as ControllerOptions,
                name: c,
                path: undefined,
                functions: {
                    ...controllers[c],
                    dtoFileName
                }
            }))
        const declarations = Object.keys(controllers).map(c =>
            addDeclarationToModule({
                ...options,
                path: options.sourceRoot + '/' + dasherize(c),
                name: dasherize(c)
            },

            ))
        return branchAndMerge(chain([
            branchAndMerge(chain(createControllers)),
            //change(options, controllers)
        ].concat(declarations)))
        //[
        //branchAndMerge(
        //    chain([
        //        //mergeWith(generate(options)),
        //        ((change(options)
        //   ]))
        // ]
    }
}

function resolveRefs(json, original = null) {
    original ??= json
    for (let k in json) {
        if (k === '$ref' && json[k].match(/^#\//)) {
            let tmp = original
            let arr = json[k].split('/')
            json.dto = arr[arr.length - 1]
            while (arr.shift(), arr.length) tmp = tmp[arr[0]]
            delete json[k]
            for (let k2 in tmp) json[k2] = tmp[k2]
        } else if (typeof json[k] === 'object') {
            json[k] = resolveRefs(json[k], original)
        }
    }
    return json
}

function getControllers(tree: Tree, options: any) {
    let { content } = readJson(tree, options, options.openapi)
    content = resolveRefs(content)
    tree.create('api-out.json', JSON.stringify(content, null, 4))
    const controllers = {}
    Object.keys(content?.paths).forEach(p => {
        const parts = p.split('/').filter(e => e !== '' && ! /^v?[0-9]+[0-9.]*$/.test(e))
        if (parts.length === 0) return
        const controller = options.name ?? parts.shift()
        const base = options.name ? '/' : '/' + controller
        const requests = content.paths[p]
        controllers[controller] = {
            ...controllers[controller],
            base
        }
        controllers[controller].paths ??= {}
        controllers[controller].paths['/' + parts.join('/')] = requests
        controllers[controller].dtoImports =
            (controllers[controller].dtoImports ?? [])
                .concat(
                    Object.keys(requests).map(req =>
                        requests[req].parameters.map(p =>
                            p.in === 'header' && !options.header ? undefined
                                : p.schema?.dto
                                    ? typeName(p.schema.dto)
                                    : p.schema?.oneOf ? p.schema?.oneOf.map(x => typeName(x.dto)) : undefined
                        ).flat().concat(
                            requests[req].requestBody?.content?.["application/json"]?.schema?.properties
                                ? Object.keys(requests[req].requestBody.content["application/json"].schema.properties).map(v =>
                                    requests[req].requestBody.content["application/json"].schema.properties[v].dto
                                        ? typeName(requests[req].requestBody.content["application/json"].schema.properties[v].dto)
                                        : undefined
                                )
                                : []
                        )).flat())
                .sort().filter((x, i, a) => x !== undefined && (i === 0 || x !== a[i - 1]))
        controllers[controller].imports ??= []
        controllers[controller].imports = controllers[controller].imports.concat(
            Object.values(requests).map((v: any) =>
                v?.parameters?.map(p => {
                    switch (p.in) {
                        case 'header':
                            if (!options.headers) return
                            return 'Headers'
                        case 'query': return 'Query'
                        case 'body': return 'Body'
                        case 'param': return 'Param'
                        default: return
                    }
                }).filter(x => !!x).concat(v?.requestBody ? ['Body'] : [])
            ).flat(),
            Object.keys(requests).map(str =>
                str.charAt(0).toUpperCase()
                + str.slice(1))
        ).sort().filter((x, i, a) => i === 0 || x !== a[i - 1])
    })
    return { controllers, schemas: content.components?.schemas }
}

function change(options: any, controllers): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        Object.keys(controllers).forEach(name => {
            const { path, content } = read(tree, options, name + '/' + name + '.controller.ts', options.sourceRoot)
            content.map(line => {
                if (!line.match('METHODS_HERE')) return line
                return line
            })
            tree.overwrite(path, content.join('\n'))
        })
        return tree
    }
}

const read = (tree: Tree, options: any, name: RegExp | string, dir: string = '') => {
    const path = find(tree, options, name, dir)
    return { path, content: tree.read(path).toString().split('\n') }
}

const readJson = (tree: Tree, options: any, name: RegExp | string, dir: string = '') => {
    const path = find(tree, options, name, dir)
    return { path, content: JSON.parse(tree.read(path).toString()) }
}

const readYaml = (tree: Tree, options: any, name: RegExp | string, dir: string = '') => {
    const path = find(tree, options, name, dir)
    return { path, content: yaml.load(tree.read(path).toString()) }
}

const find = (tree: Tree, options: any, name: RegExp | string, dir: string = '') => {
    const entry: DirEntry = tree.getDir((options.dir ?? '') + (dir))
    return join(entry.path, entry.subfiles.find(f => typeof name === 'string' ? name === f : name.test(f))?.valueOf())
}

const addImport = (content: string[], line: string) =>
    addLine(content, line, { afterLast: /^\s*import\s+/ })

const addLine = (content: string[], line: string, where: { after?: RegExp, afterLast?: RegExp, first?, last?}) =>
    content.find(l => l.includes(line.trim()))
        ? content
        : where.after
            ? content.splice(content.findIndex(e => where.after.test(e)) + 1, 0, line)
            : where.afterLast
                ? content.splice(content.findLastIndex(e => where.afterLast.test(e)) + 1, 0, line)
                : where.first
                    ? content.unshift(line)
                    : content.push(line)

const addText = (content: string[], line: string, after: RegExp) =>
    content.find(l => l.includes(line.trim()))
        ? content
        : content.splice(0, content.length, ...content.join('\n').replace(after, x => x + line).split('\n'))

const generate = (options: any) =>
    (context: SchematicContext) =>
        apply(url('./files'), [
            template({
                ...strings,
                ...options,
            }),
            move(options.path ?? '')
        ])(context)

const pwgen = (length = 10, characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.:,;+") =>
    ".".repeat(length).split('').map(() =>
        characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('')

function addDeclarationToModule(options: any): Rule {
    return (tree: Tree) => {
        if (options.skipImport !== undefined && options.skipImport) {
            return tree
        }
        options.module = new ModuleFinder(tree).find({
            path: options.sourceRoot as Path,
        })
        if (!options.module) {
            return tree
        }
        const content = tree.read(options.module).toString()
        const declarator: ModuleDeclarator = new ModuleDeclarator()
        tree.overwrite(
            options.module,
            declarator.declare(content, {
                ...options,
                type: 'module',
                metadata: 'imports'
            } as DeclarationOptions),
        )
        return tree
    }
}