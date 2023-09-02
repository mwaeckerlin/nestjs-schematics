import {join, strings} from '@angular-devkit/core'
import {apply, branchAndMerge, chain, DirEntry, filter, mergeWith, move, noop, Rule, SchematicContext, template, Tree, url} from '@angular-devkit/schematics'
import * as yaml from 'js-yaml'

export function main(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) =>
        chain([
            branchAndMerge(
                chain([
                    mergeWith(generate(options)),
                    change(options)
                ]))
        ])
}

export function change(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        // update main.ts
        {
            const {path, content} = read(tree, options, /^main\.[tj]s$/, '/src')
            content.join('\n').replace(/(bootstrap\(AppModule, name, port)(, *{(.*)}( *))?\)/, (a, p1, p2, p3) => `${p1}, {${'orb: true' + (p3 ? ', ' + p3 : '')}})`).split('\n')
            tree.overwrite(path, content.join('\n'))
        }

        // update tsconfig.json
        {
            const {path, content} = readJson(tree, options, /^package.json$/)
            const dependencies = {
                "@mikro-orm/core": "*",
                "@mikro-orm/nestjs": "*",
                "@mikro-orm/migrations": "*",
                "@mikro-orm/reflection": "*",
                "uuid": "*",
                ...content.dependencies
            }
            dependencies["@mikro-orm/" + options.type] ??= "*"
            const devDependencies = {
                "@mikro-orm/cli": "*",
                ...content.devDependencies
            }
            const scripts = {
                ...{
                    "migration": "mikro-orm migration:create",
                    "migration:initial": "mikro-orm migration:create --initial"
                },
                ...content.scripts
            }
            tree.overwrite(path, JSON.stringify({...content, dependencies, devDependencies, scripts}, null, 4))
        }

        // update docker-compose.yaml
        let config
        {
            const {path, content} = readYaml(tree, options, /^docker-compose.yaml$/)
            content.services.backend.environment = {
                ...{
                    "DB_TYPE": options.type,
                    "DB_NAME": "database",
                    "DB_HOST": "db",
                    "DB_USER": "user",
                    "DB_PASSWORD": pwgen(),
                    "DB_PORT": options.type === 'postgresql' ? 5432 : options.type === 'mysql' || options.type === 'mariadb' ? 3306 : null
                },
                ...content.services.backend.environment
            }
            content.services.backend.networks ??= []
            content.services.backend.networks.push('db-network')
            switch (content.services.backend.environment.DB_TYPE) {
                case 'postgresql':
                    content.services.db = {
                        image: content.services.backend.environment.DB_TYPE,
                        ports: [
                            content.services.backend.environment.DB_PORT + ':' + content.services.backend.environment.DB_PORT
                        ],
                        environment: {
                            POSTGRES_PASSWORD: content.services.backend.environment.DB_PASSWORD,
                            POSTGRES_USER: content.services.backend.environment.DB_USER,
                            POSTGRES_DB: content.services.backend.environment.DB_NAME
                        },
                        volumes: [{
                            type: "volume",
                            source: "db-volume",
                            target: "/var/lib/postgresql/data"
                        }],
                        networks: [
                            "db-network"
                        ]
                    }
                    break
                case 'mysql':
                    content.services.db = {
                        image: content.services.backend.environment.DB_TYPE,
                        ports: [
                            content.services.backend.environment.DB_PORT + ':' + content.services.backend.environment.DB_PORT
                        ],
                        environment: {
                            MYSQL_ROOT_PASSWORD: pwgen(40),
                            MYSQL_PASSWORD: content.services.backend.environment.DB_PASSWORD,
                            MYSQL_USER: content.services.backend.environment.DB_USER,
                            MYSQL_DATABASE: content.services.backend.environment.DB_NAME
                        },
                        volumes: [{
                            type: "volume",
                            source: "db-volume",
                            target: "/var/lib/mysql"
                        }],
                        networks: [
                            "db-network"
                        ]
                    }
                    break
                case 'mariadb':
                    content.services.db = {
                        image: content.services.backend.environment.DB_TYPE,
                        ports: [
                            content.services.backend.environment.DB_PORT + ':' + content.services.backend.environment.DB_PORT
                        ],
                        environment: {
                            MARIADB_ROOT_PASSWORD: pwgen(40),
                            MARIADB_PASSWORD: content.services.backend.environment.DB_PASSWORD,
                            MARIADB_USER: content.services.backend.environment.DB_USER,
                            MARIADB_DATABASE: content.services.backend.environment.DB_NAME
                        },
                        volumes: [{
                            type: "volume",
                            source: "db-volume",
                            target: "/var/lib/mysql"
                        }],
                        networks: [
                            "db-network"
                        ]
                    }
                    break
                case 'mongo':
                    content.services.db = {
                        image: content.services.backend.environment.DB_TYPE,
                        environment: {
                            MONGO_INITDB_ROOT_PASSWORD: content.services.backend.environment.DB_PASSWORD,
                            MONGO_INITDB_ROOT_USERNAME: content.services.backend.environment.DB_USER,
                        },
                        volumes: [{
                            type: "volume",
                            source: "db-volume",
                            target: "/data/db"
                        }],
                        networks: [
                            "db-network"
                        ]
                    }
                    break
                case 'sqlite':
                    break
                default:
                    throw new Error('Unknown Database Type: ' + content.services.backend.environment.DB_TYPE)
                    break
            }
            content.volumes = {
                ...{"db-volume": {}},
                ...content.volumes
            }
            content.networks = {
                ...{"db-network": {}},
                ...content.networks
            }
            tree.overwrite(path, yaml.dump({...content}))
            config = content.services.backend.environment
        }

        // set local test environment in .env
        {
            const {path, content} = read(tree, options, /^.env$/)
            addLine(content, 'DB_TYPE=' + config.DB_TYPE, {last: true})
            addLine(content, 'DB_NAME=' + config.DB_NAME, {last: true})
            addLine(content, 'DB_HOST="127.0.0.1"', {last: true})
            addLine(content, 'DB_USER=' + config.DB_USER, {last: true})
            addLine(content, 'DB_PASSWORD=' + config.DB_PASSWORD, {last: true})
            addLine(content, 'DB_PORT=' + config.DB_PORT, {last: true})
            tree.overwrite(path, content.join('\n'))
        }

        // update app.module.ts, add import
        {
            const {path, content} = read(tree, options, /^app\.module\.[tj]s$/, '/src')
            addImport(content, "import { MikroOrmModule } from '@mikro-orm/nestjs'")
            addText(content, 'MikroOrmModule.forRoot(),', /\s+imports:\s*\[/)
            tree.overwrite(path, content.join('\n'))
        }
        return tree
    }
}

const read = (tree: Tree, options: any, name: RegExp, dir: string = '') => {
    const path = find(tree, options, name, dir)
    return {path, content: tree.read(path).toString().split('\n')}
}

const readJson = (tree: Tree, options: any, name: RegExp, dir: string = '') => {
    const path = find(tree, options, name, dir)
    return {path, content: JSON.parse(tree.read(path).toString())}
}

const readYaml = (tree: Tree, options: any, name: RegExp, dir: string = '') => {
    const path = find(tree, options, name, dir)
    return {path, content: yaml.load(tree.read(path).toString())}
}

const find = (tree: Tree, options: any, name: RegExp, dir: string = '') => {
    const entry: DirEntry = tree.getDir((options.dir ?? '') + (dir))
    return join(entry.path, entry.subfiles.find(f => name.test(f))?.valueOf())
}

const addImport = (content: string[], line: string) =>
    addLine(content, line, {afterLast: /^\s*import\s+/})

const addLine = (content: string[], line: string, where: {after?: RegExp, afterLast?: RegExp, first?, last?}) =>
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
